import {
  ForbiddenException,
  NotFoundException,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAppointmentDto } from './dto/appointment.dto'
import { AppointmentStatus, PaymentStatus, PaymentMethod } from '@prisma/client'
import { startOfWeek, endOfWeek } from 'date-fns'
import { StripeService, CreateCheckoutDto } from '../stripe/stripe.service'

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(dto: CreateAppointmentDto, clientId: string) {
    this.logger.log(`Creating appointment for client ${clientId}`)

    // 1. Validar se a data é futura
    if (dto.dateTime < new Date()) {
      this.logger.warn('Attempted to create appointment in the past')
      throw new ForbiddenException('Time travel not allowed')
    }

    // 2. Validar plano de assinatura e uso
    let useFreeSession = false
    const userPlan = await this.prisma.userPlan.findFirst({
      where: { userId: clientId, isActive: true },
      select: { id: true, cleaningsPerWeek: true },
    })
    if (userPlan) {
      const weekStart = startOfWeek(dto.dateTime, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(dto.dateTime, { weekStartsOn: 1 })
      const sessionCount = await this.prisma.appointment.count({
        where: {
          clientId,
          dateTime: { gte: weekStart, lte: weekEnd },
        },
      })
      if (sessionCount >= userPlan.cleaningsPerWeek) {
        this.logger.warn(`Client ${clientId} exceeded weekly appointment limit`)
        throw new ForbiddenException('Limit of appointments reached')
      }
      useFreeSession = true
    }

    // 3. Validar entidades necessárias
    const { addressId, cleanerId, cleaningTypeId, dateTime, notes } = dto
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    })
    if (!address) {
      this.logger.warn(`Address ${addressId} not found`)
      throw new NotFoundException('Address not found')
    }
    const cleaningType = await this.prisma.cleaningType.findUnique({
      where: { id: cleaningTypeId },
      select: { id: true, duration: true, price: true },
    })
    if (!cleaningType) {
      this.logger.warn(`Cleaning type ${cleaningTypeId} not found`)
      throw new NotFoundException('Invalid Cleaning Type')
    }
    const cleaner = await this.prisma.cleanerProfile.findUnique({
      where: { id: cleanerId },
      select: { isActive: true, stripeAccountId: true },
    })
    if (!cleaner || !cleaner.isActive) {
      this.logger.warn(`Cleaner ${cleanerId} not found or inactive`)
      throw new NotFoundException('Cleaner not found or inactive')
    }
    if (!cleaner.stripeAccountId) {
      this.logger.warn(`Cleaner ${cleanerId} does not have a Stripe account`)
      throw new ForbiddenException('Cleaner does not have a Stripe account')
    }

    const date = new Date(dateTime) // Converte dateTime para Date

    // Verifica se a data é válida
    if (Number.isNaN(date.getTime())) {
      throw new Error('Data inválida fornecida para dateTime')
    }

    // 4. Validar disponibilidade do limpador
    const conflicting = await this.prisma.appointment.findFirst({
      where: {
        cleanerId,
        dateTime: {
          gte: new Date(date.getTime() - (cleaningType.duration ?? 60) * 60000),
          lte: new Date(date.getTime() + (cleaningType.duration ?? 60) * 60000),
        },
      },
    })
    if (conflicting) {
      this.logger.warn(`Cleaner ${cleanerId} not available at ${dateTime}`)
      throw new ForbiddenException(
        'Cleaner not available at this date and time',
      )
    }

    // 5. Criar agendamento e atualizar uso do plano
    const appointment = await this.prisma.$transaction(async (tx) => {
      const newApp = await tx.appointment.create({
        data: {
          clientId,
          cleanerId,
          addressId,
          cleaningTypeId,
          userPlanId: userPlan?.id,
          dateTime,
          status: AppointmentStatus.PENDING,
          notes,
        },
      })

      if (useFreeSession) {
        await tx.userPlan.update({
          where: { id: userPlan?.id },
          data: { usedCleanings: { increment: 1 } },
        })
      }

      return newApp
    })

    this.logger.log(`Appointment ${appointment.id} created with status PENDING`)

    // 6. Criar sessão de pagamento com Stripe (se não for uma sessão gratuita)
    let stripeSessionId: string | null = null
    if (!useFreeSession) {
      const totalAmount = cleaningType.price.toNumber() // Converter Decimal para number
      const platformFee = Math.round(totalAmount * 0.1) // 10% para a plataforma
      // TODO: Substituir por valores dinâmicos em produção
      const secondRecipientAmount = 10 // Valor fixo para teste, ajustar conforme necessário
      const secondRecipientAccountId = 'acct_xxx' // Substituir pelo ID real da segunda conta

      const checkoutDto: CreateCheckoutDto = {
        amount: totalAmount,
        currency: 'usd',
        diaristAccountId: cleaner.stripeAccountId,
        platformFee,
        secondRecipientAccountId,
        secondRecipientAmount,
        bookingId: appointment.id,
      }

      try {
        const session =
          await this.stripeService.createCheckoutSession(checkoutDto)
        stripeSessionId = session.id

        // Criar registro de pagamento com o stripeSessionId como transactionId
        await this.prisma.payment.create({
          data: {
            id: stripeSessionId, // Usar o sessionId como ID do pagamento
            appointmentId: appointment.id,
            amount: totalAmount,
            method: PaymentMethod.CREDIT_CARD, // Ajustar conforme necessário
            transactionId: stripeSessionId,
            status: PaymentStatus.PENDING,
            currency: 'USD',
          },
        })

        this.logger.log(
          `Payment record created with transactionId ${stripeSessionId} for appointment ${appointment.id}`,
        )
      } catch (err) {
        this.logger.error(
          `Failed to create Stripe session or payment for appointment ${appointment.id}: ${err.message}`,
        )
        throw new BadRequestException('Failed to create payment session')
      }
    }

    return {
      appointment,
      stripeSessionId,
    }
  }
}
