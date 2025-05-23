/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './jwt.strategy'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        isActive: true,
      },
    })

    if (!user) throw new UnauthorizedException('Invalid credentials')
    if (!user.isActive)
      throw new UnauthorizedException(
        'Inactive user. Please contact the support team.',
      )

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials')

    const { password: _pass, isActive: _isActive, ...result } = user

    return result
  }

  async login(LoginDto: LoginDto) {
    const user = await this.validateUser(LoginDto.email, LoginDto.password)

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
