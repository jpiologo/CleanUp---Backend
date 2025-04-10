// src/appointments/dto/create-appointment.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsInt,
  IsString,
  IsNotEmpty,
} from 'class-validator'

export class CreateAppointmentDto {
  @ApiProperty({ example: '2025-05-15T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dateTime: string

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsInt()
  duration?: number

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

  @ApiProperty({ example: 'cleaner-id-uuid', required: false })
  @IsNotEmpty()
  @IsUUID()
  cleanerId: string

  @ApiProperty({ example: 'address-id-uuid' })
  @IsNotEmpty()
  @IsUUID()
  addressId: string
}
