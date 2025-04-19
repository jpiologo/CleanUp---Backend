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

  @ApiProperty({ description: 'Cleaner Stripe account ID' })
  @IsUUID()
  stripeAccountId?: string;
}

export class UpdateCleanerProfileDto extends PartialType(CreateCleanerProfileDto) {}

export class GetNearbyCleanerProfilesDto {
  @ApiProperty({ description: 'ID of the address to use for proximity filtering' })
  @IsUUID()
  addressId: string;
}

export class DisableCleanerProfileDto {
  @ApiProperty({ description: 'ID of the user to disable profile for' })
  @IsUUID()
  userId: string;
}

export class CleanerProfileWithUserDto {
  id: string;
  bio: string | null;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  user: {
    firstName: string;
    lastName: string;
  };
}
