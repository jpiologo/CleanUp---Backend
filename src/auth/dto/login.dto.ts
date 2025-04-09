import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsNotEmpty } from 'class-validator'

export class LoginDto {
    

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'john@test.com' })
  email: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123@*/hJ' })
  password: string
}
