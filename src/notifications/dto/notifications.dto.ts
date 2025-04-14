import { ApiProperty } from '@nestjs/swagger'
import { NotificationType } from '@prisma/client'
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MaxLength,
  IsUUID,
  IsBoolean,
} from 'class-validator'

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @ApiProperty({ example: 'REMINDER', enum: NotificationType })
  type: NotificationType

  @ApiProperty({ example: 'Do not forget your appointment for tomorrow!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string

  @ApiProperty({ example: 'Lorem Ipsum' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  message: string

  @IsUUID()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  userId: string
}

export class UpdateNotificationDto {
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Whether the notification has been read' })
  isRead: boolean
}
