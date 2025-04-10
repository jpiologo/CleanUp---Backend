import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator'

export class CreateAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  street: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  number: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  zipCode: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean
}

export class UpdateAddressDto extends CreateAddressDto {}