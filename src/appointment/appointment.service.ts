import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto, AppointmentResponseDto } from './dto/appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, clientId: string): Promise<AppointmentResponseDto> {
    // Valida se o addressId é fornecido
    if (!dto.addressId) {
      throw new NotFoundException('Address ID is required');
    }

    try {
      // Cria o agendamento
      const appointment = await this.prisma.appointment.create({
        data: {
          ...dto,
          clientId,
          status: AppointmentStatus.PENDING,
        },
      });

      // Busca o endereço pelo ID
      const address = await this.prisma.address.findUnique({
        where: { id: dto.addressId },
      });

      // Verifica se o endereço existe
      if (!address) {
        throw new NotFoundException(`Address with ID ${dto.addressId} not found`);
      }

      // Mapeia o appointment para o DTO de resposta
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
      };

      // Retorna a mensagem com o nome da rua e o agendamento
      return {
        ...appointmentResponse,
      };

    } catch (error) {
      // Trata erros do Prisma ou outros
      throw new Error(`Failed to create appointment: ${error}`);
    }
  }
}