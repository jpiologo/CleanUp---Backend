import {
  Injectable,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAppointmentDto } from './dto/appointment.dto'
import { Appointment, AppointmentStatus } from '@prisma/client'

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, clientId: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.create({
      data: {
        ...dto,
        clientId,
        status: AppointmentStatus.PENDING,
      },
    })

    return appointment
  }
  
}
