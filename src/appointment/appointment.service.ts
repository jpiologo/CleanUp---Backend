import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAppointmentDto } from './dto/appointment.dto'
import { AppointmentStatus } from '@prisma/client'
import { startOfWeek, endOfWeek } from 'date-fns'

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, clientId: string) {
    // 1. Validar se a data é futura
    if (dto.dateTime < new Date()) {
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
        throw new ForbiddenException('Limit of appointments reached')
      }
      useFreeSession = true
    }

    // 3. Validar entidades necessárias
    const { addressId, cleanerId, cleaningTypeId, dateTime, notes } = dto
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    })
    if (!address) throw new NotFoundException('Address not found')
    const cleaningType = await this.prisma.cleaningType.findUnique({
      where: { id: cleaningTypeId },
    })
    if (!cleaningType) throw new NotFoundException('Invalid Cleaning Type')
    const cleaner = await this.prisma.cleanerProfile.findUnique({
      where: { userId: cleanerId },
      select: { isActive: true, stripeAccountId: true },
    })
    if (!cleaner || !cleaner.isActive)
      throw new NotFoundException('Cleaner not found or inactive')

    // 4. Validar disponibilidade do limpador
    const conflicting = await this.prisma.appointment.findFirst({
      where: {
        cleanerId,
        dateTime: {
          gte: new Date(
            dateTime.getTime() - (cleaningType.duration ?? 60) * 60000,
          ),
          lte: new Date(
            dateTime.getTime() + (cleaningType.duration ?? 60) * 60000,
          ),
        },
      },
    })
    if (conflicting)
      throw new ForbiddenException('Cleaner not avaiable at this date and time')

    // 5. Criar agendamento e atualizar uso do plano 

    const appointment = await this.prisma.$transaction(async (tx) => {
      const newApp = await tx.appointment.create({
        data: {
          clientId,
          cleanerId,
          addressId,
          cleaningTypeId,
          planId: userPlan?.id,
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

    return appointment
  }
}
