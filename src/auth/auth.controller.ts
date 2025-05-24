import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Res, // Adicionado para manipular a resposta
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express'; // Importa o tipo Response do Express
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
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    // Chama o serviço para validar o usuário e gerar o token
    const { access_token } = await this.authService.login(loginDto);

    // Configura o cookie com o token JWT
    res.cookie('jwt', access_token, {
      httpOnly: true, // Impede acesso via JavaScript
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'strict', // Protege contra CSRF
      maxAge: 24 * 60 * 60 * 1000, // Expira em 1 dia (em milissegundos)
      path: '/', // Disponível para toda a aplicação
    });

    // Retorna uma resposta sem o token no corpo
    return res.status(HttpStatus.OK).json({
      message: 'Login bem-sucedido',
    });
  }

  /* ──────────────────────────  ME  ───────────────────────────── */

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    // O guard já garante que user existe; sem necessidade de lançar 401 aqui
    const { password, ...safeUser } = user;
    return safeUser;
  }
}