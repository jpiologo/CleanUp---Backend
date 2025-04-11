import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCleanerProfileDto {
  @ApiProperty({ description: 'ID of the user to associate the profile with' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Short biography', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateCleanerProfileDto extends PartialType(CreateCleanerProfileDto) {}

export class DisableCleanerProfileDto {
  @ApiProperty({ description: 'ID of the user to disable profile for' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Whether the profile is active' })
  @IsBoolean()
  isActive: boolean;
}