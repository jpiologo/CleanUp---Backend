import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate user and return JWT token' })
    @ApiResponse({ status: 200, description: 'User authenticated' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() LoginDto: LoginDto) {
        return this.authService.login(LoginDto);
    }
}
