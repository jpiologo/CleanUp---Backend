import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator'

export class CreateUserPlanDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string

  @ApiProperty({ description: 'Plan ID' })
  @IsUUID()
  planId: string

  @ApiProperty({
    description: 'Start date of the plan',
    example: '2024-05-01T00:00:00Z',
  })
  @IsDateString()
  startDate: string

  @ApiProperty({
    description: 'End date of the plan',
    example: '2024-11-01T00:00:00Z',
  })
  @IsDateString()
  endDate: string

  @ApiProperty({ description: 'External payment ID', required: false })
  @IsOptional()
  @IsString()
  paymentId?: string
}

export class UpdateUserPlanDto extends PartialType(CreateUserPlanDto) {
  @ApiProperty({ description: 'UserPlan ID' })
  @IsUUID()
  id: string
}
