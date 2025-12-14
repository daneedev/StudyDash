import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { ClassDto } from "src/dto/";
import { AuthGuard } from "src/auth/auth.guard";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ClassesAdminGuard, ClassesGuard } from "./classes.guard";

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}
  // Controller methods will go here
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get list of all users classes' })
  @ApiResponse({
    status: 200,
    description: 'List of classes retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: [
        {
          id: 1,
          name: 'Math 101',
          inviteCode: 'ABCD1234',
        },
      ],
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
  @ApiBearerAuth()
  @Get() getClasses(@Req() req) {
    return this.classesService.getAllUserClasses(req.user);
  }

  @UseGuards(AuthGuard, ClassesGuard)
  @ApiOperation({ summary: 'Get class details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
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
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access to class denied',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Class not found',
    },
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Get(':id') getClassById(@Param('id') id: number) {
    return this.classesService.getClassById(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
    example: {
      success: true,
      statusCode: 201,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
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
  @ApiBearerAuth()
  @Post() createClass(@Body() dto: ClassDto, @Req() req) {
    return this.classesService.createClass(dto, req.user);
  }

  @UseGuards(AuthGuard, ClassesAdminGuard)
  @ApiOperation({ summary: 'Update class details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101 - Updated',
        inviteCode: 'ABCD1234',
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
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Patch(':id') updateClass(@Body() dto: ClassDto, @Param('id') id: number) {
    return this.classesService.updateClass(dto, id);
  }

  @UseGuards(AuthGuard, ClassesAdminGuard)
  @ApiOperation({ summary: 'Delete class by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
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
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Delete(':id') deleteClass(@Param('id') id: number) {
    return this.classesService.deleteClass(id);
  }
}