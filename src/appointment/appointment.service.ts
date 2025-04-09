import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { AppointmentStatus } from '@prisma/client'

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    })

    if (!address || address.userId !== userId) {
      throw new BadRequestException('Endereço inválido para este usuário.')
    }

    return this.prisma.appointment.create({
      data: {
        ...dto,
        status: AppointmentStatus.SCHEDULED,
        clientId: userId,
      },
    })
  }

  async findAllByUser(userId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId: userId },
      include: { address: true, cleaningType: true },
    })
  }

  async update(id: string, userId: string, dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) throw new NotFoundException('Agendamento não encontrado.')
    if (appointment.clientId !== userId) {
      throw new BadRequestException(
        'Você não tem permissão para editar este agendamento.',
      )
    }

    return this.prisma.appointment.update({
      where: { id },
      data: dto,
    })
  }
}
