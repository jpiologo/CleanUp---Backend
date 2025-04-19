import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../payments/stripe.service';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
} from './dto/appointment.dto';
import { AppointmentStatus } from '@prisma/client';
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
      if (!userPlan) {
        throw new NotFoundException('Invalid subscription plan');
      }

      // Check available sessions for the week
      const weekStart = startOfWeek(dto.dateTime, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(dto.dateTime, { weekStartsOn: 1 });

      const sessionCount = await this.prisma.appointment.count({
        where: {
          planId: dto.planId,
          clientId,
          dateTime: { gte: weekStart, lt: weekEnd },
        },
      });

      if (sessionCount >= userPlan.sessionsPerWeek) {
        throw new ForbiddenException('Weekly session limit reached');
      }

      useFreeSession = true;
    }

    // 3. Validate required entities
    const { addressId, cleanerId, cleaningTypeId, dateTime, notes, planId } = dto;

    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    const cleaningType = await this.prisma.cleaningType.findUnique({ where: { id: cleaningTypeId } });
    if (!cleaningType) {
      throw new NotFoundException('Invalid cleaning type');
    }

    const cleaner = await this.prisma.cleanerProfile.findUnique({
      where: { userId: cleanerId },
      select: { isActive: true, user: { select: { stripeAccountId: true } } },
    });
    if (!cleaner || !cleaner.isActive) {
      throw new NotFoundException(`Cleaner with ID ${cleanerId} not found or inactive`);
    }

    // 4. Validate cleaner availability
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        cleanerId,
        dateTime: {
          gte: new Date(dateTime.getTime() - (cleaningType.duration ?? 60) * 60000),
          lte: new Date(dateTime.getTime() + (cleaningType.duration ?? 60) * 60000),
        },
      },
    });
    if (conflictingAppointment) {
      throw new ForbiddenException('Cleaner is not available at this time');
    }

    // 5. Create appointment and update plan usage in a transaction
    const appointment = await this.prisma.$transaction(async (tx) => {
      const newAppointment = await tx.appointment.create({
        data: {
          clientId,
          cleanerId,
          addressId,
          cleaningTypeId,
          planId: useFreeSession ? planId : null,
          dateTime,
          status: AppointmentStatus.PENDING,
          duration: cleaningType.duration ?? 60,
          notes,
        },
      });

      if (useFreeSession && userPlan) {
        await tx.userPlan.update({
          where: { id: userPlan.id },
          data: { sessionsUsed: { increment: 1 } },
        });
      }

      return newAppointment;
    });

    // 6. Initiate payment if not a free session
    let paymentClientSecret: string | undefined;
    if (!useFreeSession) {
      if (!cleaner.user.stripeAccountId) {
        throw new ForbiddenException('Cleaner does not have a valid Stripe account');
      }

      try {
        const amountInCents = Math.round(Number(cleaningType.price) * 100);
        const feeAmount = Math.round(amountInCents * 0.2);

        const paymentIntent = await this.stripeService.client.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          application_fee_amount: feeAmount,
          transfer_data: { destination: cleaner.user.stripeAccountId },
        });

        paymentClientSecret = paymentIntent.client_secret;
      } catch (error) {
        this.logger.error(`Failed to create payment intent: ${error.message}`);
        throw new ForbiddenException('Failed to process payment');
      }
    }

    // 7. Build response DTO
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
      paymentClientSecret,
    };

    return response;
  }
}