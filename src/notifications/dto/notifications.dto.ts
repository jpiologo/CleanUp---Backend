import { ApiProperty } from '@nestjs/swagger'
import { NotificationType } from '@prisma/client'
import { IsString, IsNotEmpty, IsBoolean, IsEnum } from 'class-validator'

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @ApiProperty({ example: 'REMINDER' })
  type: NotificationType

  @ApiProperty({ example: 'Do not forget your appointment for tomorrow!' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: 'Lorem Ipsum' })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  read: boolean

  @ApiProperty({ example: '' })

    @ApiProperty({ example: '2023-10-01T12:00:00Z' })
}
