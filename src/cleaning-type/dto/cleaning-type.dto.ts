import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCleaningTypeDto {
  @ApiProperty({ example: 'Deep Cleaning' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'A complete and thorough cleaning for large homes', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 189.90 })
  @IsNumber()
  price: number

  @ApiProperty({ example: 120, description: 'Duration in minutes', required: false })
  @IsInt()
  @IsOptional()
  duration?: number
}

export class UpdateCleaningTypeDto extends CreateCleaningTypeDto {
  @ApiProperty({ example: 'a12cde34-b56f-78gh-90ij-klmnopqrstuv' })
  @IsString()
  @IsNotEmpty()
  id: string
}
