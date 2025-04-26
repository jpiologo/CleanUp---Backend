import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate user and return JWT token' })
    @ApiResponse({ status: 200, description: 'User authenticated' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() LoginDto: LoginDto) {
        return this.authService.login(LoginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getLoggedUser(@CurrentUser() user: User) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safeUser } = user;
        return safeUser;
    }
}
