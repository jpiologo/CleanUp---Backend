import { ApiProperty } from '@nestjs/swagger'
import type { PlanRecurrence } from '@prisma/client'
import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

export class CreatePlanDto {
  @ApiProperty({ example: 'Shiny' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 500_00 })
  @IsNotEmpty()
  @IsNumber()
  price: number

  @ApiProperty({ example: 'ANNUAL' })
  @IsString()
  @IsNotEmpty()
  recurrence: PlanRecurrence

  @ApiProperty({ example: 365 })
  @IsNotEmpty()
  @IsNumber()
  daysToExpire: number

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  cleaningsPerWeek: number
}
