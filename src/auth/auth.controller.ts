import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ──────────────────────────  LOGIN  ────────────────────────── */

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return JWT token' })
  @ApiResponse({ status: 200, description: 'JWT token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    // nome minúsculo evita confundir a variável com a classe DTO
    return this.authService.login(loginDto);
  }

  /* ──────────────────────────  ME  ───────────────────────────── */

  @UseGuards(JwtAuthGuard)      
  @ApiBearerAuth()              
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    // o guard já garante que user existe; sem necessidade de lançar 401 aqui
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
