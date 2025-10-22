import { Body, Controller, Post, Get, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login();
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
