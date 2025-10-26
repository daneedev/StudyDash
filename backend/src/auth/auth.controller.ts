import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from '../dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and obtain access token' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    example: {
      success: true,
      statusCode: 200,
      data: {
        accessToken: 'eyJhbGc...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Arguments are missing',
    example: {
      success: false,
      statusCode: 400,
      message: ['password should not be empty', 'password must be a string'],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid username or password',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid username or password',
    },
  })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    example: {
      success: true,
      statusCode: 201,
      data: {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Arguments are missing or password is too short',
    example: {
      success: false,
      statusCode: 400,
      message: [
        'email must be an email',
        'password must be longer than 8 characters',
      ],
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email or username already exists',
    example: {
      success: false,
      statusCode: 409,
      message: 'User with this email already exists',
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
