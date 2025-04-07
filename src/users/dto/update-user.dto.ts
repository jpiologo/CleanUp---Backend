import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { UserRole } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

export class UpdateUsersDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({ example: 'ADMIN', enum: UserRole })
  role: UserRole
}
