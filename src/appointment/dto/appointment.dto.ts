// src/appointments/dto/create-appointment.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsString,
  IsNotEmpty,
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
