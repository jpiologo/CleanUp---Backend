import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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