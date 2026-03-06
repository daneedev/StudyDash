import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AssignmentsService } from './assignments.service';
import { ClassesGuard } from 'src/classes/classes.guard';
import { CreateAssignmentDto, UpdateAssignmentDto } from 'src/dto';

@Controller('assignments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
    constructor(private assignmentsService: AssignmentsService) {}

    @ApiOperation({ summary: 'Get assignments by class ID' })
    @UseGuards(ClassesGuard)
    @ApiResponse({
        status: 200,
        description: 'Assignments retrieved successfully',
        example: {
            success: true,
            statusCode: 200,
            data: [
                {
                    id: 1,
                    title: 'Homework 1',
                    description: 'Complete exercises 1-10',
                    dueDate: '2024-12-01T23:59:59Z',
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
    @Get("/:classId")
    getAssignmentsByClass(@Param("classId") classId: string) {
        return this.assignmentsService.getAssignmentsByClass(classId);
    }

    @ApiOperation({ summary: 'Create a new assignment' })
    @ApiResponse({
        status: 201,
        description: 'Assignment created successfully',
        example: {
            success: true,
            statusCode: 201,
            data: {
                id: 1,
                title: 'Homework 1',
                description: 'Complete exercises 1-10',
                dueDate: '2024-12-01T23:59:59Z',
                classId: 1,
                addedBy: 1,
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
    @Post("/")
    createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
        return this.assignmentsService.createAssignment(dto, req.user);
    }
    @ApiOperation({ summary: 'Update an existing assignment' })
    @ApiResponse({
        status: 200,
        description: 'Assignment updated successfully',
        example: {
            success: true,
            statusCode: 200,
            data: {
                id: 1,
                title: 'Homework 1 Updated',
                description: 'Complete exercises 1-15',
                dueDate: '2024-12-05T23:59:59Z',
                classId: 1,
                addedBy: 1,
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
        description: 'Assignment not found',
        example: {
            success: false,
            statusCode: 404,
            message: 'Assignment not found',
        },
    })
    @Patch("/:id")
    updateAssignment(@Param("id") id: string, @Body() dto: UpdateAssignmentDto, @Req() req) {
        return this.assignmentsService.updateAssignment(id, dto, req.user);
    }
    @ApiOperation({ summary: 'Delete an assignment' })
    @ApiResponse({
        status: 200,
        description: 'Assignment deleted successfully',
        example: {
            success: true,
            statusCode: 200,
            message: 'Assignment deleted successfully',
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
        description: 'Assignment not found',
        example: {
            success: false,
            statusCode: 404,
            message: 'Assignment not found',
        },
    })
    @Delete("/:id")
    deleteAssignment(@Param("id") id: string, @Req() req) {
        return this.assignmentsService.deleteAssignment(id, req.user);
    }   
}
