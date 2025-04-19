import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
} from './dto/appointment.dto'
import { AppointmentStatus } from '@prisma/client'

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateAppointmentDto,
    clientId: string,
  ): Promise<AppointmentResponseDto> {
    // Error and exception handling
    if (!dto.addressId) {
      throw new NotFoundException('At least one Address is required')
    }
    if (!dto.cleaningTypeId) {
      throw new NotFoundException('At least one Cleaning Type is required')
    }
    if (!dto.dateTime) {
      throw new NotFoundException('At least one Date is required')
    }
    if (!dto.cleanerId) {
      throw new NotFoundException('At least one Cleaner is required')
    }
    if (dto.planId) {
      const userSubscriptionPlan = await this.prisma.userPlan.findFirst({
        where: { id: dto.planId, userId: clientId },
      })
      if (!userSubscriptionPlan) {
        throw new NotFoundException('The informed subscription plan is Invalid')
      }
    }
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    })
    if (!address) {
      throw new NotFoundException(`Address with ID ${dto.addressId} not found`)
    }

    try {
      const appointment = await this.prisma.appointment.create({
        data: {
          ...dto,
          clientId,
          status: AppointmentStatus.PENDING,
        },
      })

      // Create payment session with Stripe

      const appointmentResponse: AppointmentResponseDto = {
        id: appointment.id,
        dateTime: appointment.dateTime,
        status: appointment.status,
        notes: appointment.notes || '',
        cleaningTypeId: appointment.cleaningTypeId,
        planId: appointment.planId || '',
        clientId: appointment.clientId,
        cleanerId: appointment.cleanerId,
        addressId: appointment.addressId,
      }

      return {
        ...appointmentResponse,
      }
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error}`)
    }
  }
}
