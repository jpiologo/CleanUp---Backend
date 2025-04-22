/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class CreateUserPlanDto {

  @ApiProperty({ description: 'Plan ID' })
  @IsNotEmpty()
  @IsUUID()
  planId: string

  @ApiProperty({ description: 'External payment ID', required: false })
  @IsNotEmpty()
  @IsUUID()
  paymentId?: string
}

export class UpdateUserPlanDto extends PartialType(CreateUserPlanDto) {
  @ApiProperty({ description: 'UserPlan ID' })
  @IsUUID()
  id: string
}
