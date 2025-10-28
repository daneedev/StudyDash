import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}
