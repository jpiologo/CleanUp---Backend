import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { UserRole } from '@prisma/client'
import { IsBoolean, IsEnum, IsOptional } from 'class-validator'

export class UpdateUsersDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({ example: 'ADMIN', enum: UserRole })
  role: UserRole

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Indicates if the user is active' })
  isActive: boolean
}
