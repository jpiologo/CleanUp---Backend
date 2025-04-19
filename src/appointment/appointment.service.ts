import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../payments/stripe/stripe.service';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
} from './dto/appointment.dto';
import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async create(
    dto: CreateAppointmentDto,
    clientId: string,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(`Creating appointment for client ${clientId}`);

    // 1. Validate dateTime is in the future
    if (dto.dateTime < new Date()) {
      throw new ForbiddenException('Cannot schedule appointments in the past');
    }

    // 2. Validate user subscription plan and usage
    let useFreeSession = false;
    if (dto.planId) {
      const userPlan = await this.prisma.userPlan.findFirst({
        where: { id: dto.planId, userId: clientId, isActive: true },
      });
      if (!userPlan) throw new NotFoundException('Invalid subscription plan');

      const weekStart = startOfWeek(dto.dateTime, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(dto.dateTime, { weekStartsOn: 1 });
      const sessionCount = await this.prisma.appointment.count({
        where: { planId: dto.planId, clientId, dateTime: { gte: weekStart, lt: weekEnd } },
      });
      if (sessionCount >= userPlan.cleaningsPerWeek) {
        throw new ForbiddenException('You reached your limit for appointments');
      }
      useFreeSession = true;
    }

    // 3. Validate required entities
    const { addressId, cleanerId, cleaningTypeId, dateTime, notes, planId } = dto;
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    const cleaningType = await this.prisma.cleaningType.findUnique({ where: { id: cleaningTypeId } });
    if (!cleaningType) throw new NotFoundException('Invalid cleaning type');
    const cleaner = await this.prisma.cleanerProfile.findUnique({
      where: { userId: cleanerId },
      select: { isActive: true, stripeAccountId: true },
    });
    if (!cleaner?.isActive) {
      throw new NotFoundException('Cleaner not found or inactive');
    }

    // 4. Validate cleaner availability
    const conflicting = await this.prisma.appointment.findFirst({
      where: {
        cleanerId,
        dateTime: {
          gte: new Date(dateTime.getTime() - (cleaningType.duration ?? 60) * 60000),
          lte: new Date(dateTime.getTime() + (cleaningType.duration ?? 60) * 60000),
        },
      },
    });
    if (conflicting) throw new ForbiddenException('Cleaner is not available at this time');

    // 5. Create appointment and update plan usage
    const appointment = await this.prisma.$transaction(async (tx) => {
      const newApp = await tx.appointment.create({
        data: {
          clientId,
          cleanerId,
          addressId,
          cleaningTypeId,
          planId: useFreeSession ? planId : null,
          dateTime,
          status: AppointmentStatus.PENDING,
          notes,
        },
      });
      if (useFreeSession) {
        await tx.userPlan.update({
          where: { id: planId },
          data: { usedCleanings: { increment: 1 } },
        });
      }
      return newApp;
    });

    // 6. Process payment if needed
    let paymentClientSecret = ''; // Initialize without explicit type
    if (!useFreeSession) {
      if (!cleaner.stripeAccountId) {
        throw new ForbiddenException('Cleaner must have a Stripe account');
      }
      try {
        const amountCents = Math.round(Number(cleaningType.price) * 100);
        const fee = Math.round(amountCents * 0.2);
        const intent = await this.stripeService.createPaymentIntent(
          amountCents,
          'usd',
          fee,
          cleaner, // Pass cleaner object
          cleaner.stripeAccountId, // Pass destinationAccount
        );
        // Record payment
        await this.prisma.payment.create({
          data: {
            appointmentId: appointment.id,
            amount: amountCents / 100,
            method: PaymentMethod.CARD,
            transactionId: intent.id,
            status: PaymentStatus.PENDING,
            currency: 'usd',
          },
        });
        paymentClientSecret = intent.client_secret ?? ''; // Fallback to empty string
      } catch (error) {
        this.logger.error(`Failed to create payment intent: ${error}`);
        throw new ForbiddenException('Failed to process payment');
      }
    }

    // 7. Build and return DTO
    const response: AppointmentResponseDto = {
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      notes: appointment.notes ?? '',
      cleaningTypeId: appointment.cleaningTypeId,
      planId: appointment.planId ?? undefined,
      clientId: appointment.clientId,
      cleanerId: appointment.cleanerId,
      addressId: appointment.addressId,
      paymentClientSecret: useFreeSession ? '' : paymentClientSecret, // Empty string for free sessions
    };
    return response;
  }
}