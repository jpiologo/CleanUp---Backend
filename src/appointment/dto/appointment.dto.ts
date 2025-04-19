// src/appointments/dto/create-appointment.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AppointmentStatus } from '@prisma/client'
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator'

export class CreateAppointmentDto {
  @ApiProperty({ example: '2025-05-15T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dateTime: Date

  @ApiProperty({ example: 'Agendamento para limpeza pesada', required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ example: 'cleaning-type-uuid' })
  @IsNotEmpty()
  @IsUUID()
  cleaningTypeId: string

  @ApiProperty({ example: 'plan-id-uuid', required: false })
  @IsOptional()
  @IsUUID()
  planId?: string

  @ApiProperty({ example: 'cleaner-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  cleanerId: string

  @ApiProperty({ example: 'address-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  addressId: string
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({ example: 'appointment-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  id: string
}

export class AppointmentResponseDto {

  @ApiProperty({ example: 'appointment-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  id: string

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus

  @ApiProperty({ example: '2025-05-15T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dateTime: Date

  @ApiProperty({ example: 'Agendamento para limpeza pesada', required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({ example: 'cleaning-type-uuid' })
  @IsNotEmpty()
  @IsUUID()
  cleaningTypeId: string

  @ApiProperty({ example: 'plan-id-uuid', required: false })
  @IsOptional()
  @IsUUID()
  planId?: string

  @ApiProperty({ example: 'client-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  clientId: string

  @ApiProperty({ example: 'cleaner-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  cleanerId: string

  @ApiProperty({ example: 'address-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  addressId: string

  @ApiProperty({ example: 'sk_test_123', required: false })
  @IsOptional()
  @IsString()
  paymentClientSecret?: string;
}