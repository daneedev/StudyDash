import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ClassesGuard } from 'src/classes/classes.guard';
import { CreateSubjectDto } from 'src/dto';

@Controller('subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard, ClassesGuard)
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Get subjects by class ID' })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: [
        {
          id: 1,
          name: 'Mathematics',
          classId: 1,
        },
        {
          id: 2,
          name: 'Science',
          classId: 1,
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
  @Get('/:classId')
  getSubjectsByClassId(@Param('classId') id: string) {
    return this.subjectsService.getSubjectsByClassId(id);
  }

  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({
    status: 201,
    description: 'Subject created successfully',
    example: {
      success: true,
      statusCode: 201,
      data: {
        id: 1,
        name: 'Mathematics',
        classId: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    example: {
      success: false,
      statusCode: 400,
      message: 'Validation failed for the provided data',
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
  @Post('/')
  createSubject(@Body() body: CreateSubjectDto) {
    return this.subjectsService.createSubject(body);
  }

  @ApiOperation({ summary: 'Edit an existing subject' })
  @ApiResponse({
    status: 200,
    description: 'Subject edited successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Updated Mathematics',
        classId: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subject not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Subject not found',
    },
  })
  @Patch('/:id')
  editSubject(@Param('id') id: string, @Body() body: { name: string }) {
    return this.subjectsService.editSubject(id, body.name);
  }

  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({
    status: 200,
    description: 'Subject deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Subject deleted successfully',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subject not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Subject not found',
    },
  })
  @Delete('/:id')
  deleteSubject(@Param('id') id: string) {
    return this.subjectsService.deleteSubject(id);
  }
}
