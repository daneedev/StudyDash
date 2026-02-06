import {
  Controller,
  Get,
  UseGuards,
  Req,
  Put,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from 'src/dto/users.dto';
import { AuthDto } from 'src/dto';

@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  getProfile(@Req() req) {
    return req.user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        user: {
          id: 1,
          username: 'john_doe_updated',
          email: 'john_updated@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or username already taken',
    example: {
      success: false,
      statusCode: 409,
      message: 'Email or username already taken',
    },
  })
  updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserProfile(dto, req.user);
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete current authenticated user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'User profile deleted successfully',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  deleteProfile(@Req() req, @Body() dto: AuthDto) {
    return this.usersService.deleteUserProfile(dto, req.user);
  }
}
