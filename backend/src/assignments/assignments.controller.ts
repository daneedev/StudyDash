import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
    @Get("/:classId")
    @UseGuards(ClassesGuard)
    getAssignmentsByClass(@Param("classId") classId: number) {
        return this.assignmentsService.getAssignmentsByClass(classId);
    }
    @ApiOperation({ summary: 'Create a new assignment' })
    @Post("/")
    createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
        return this.assignmentsService.createAssignment(dto, req.user);
    }
    @ApiOperation({ summary: 'Update an existing assignment' })
    @Patch("/:id")
    updateAssignment(@Param("id") id: number, @Body() dto: UpdateAssignmentDto, @Req() req) {
        return this.assignmentsService.updateAssignment(id, dto, req.user);
    }
    @ApiOperation({ summary: 'Delete an assignment' })
    @Delete("/:id")
    deleteAssignment(@Param("id") id: number, @Req() req) {
        return this.assignmentsService.deleteAssignment(id, req.user);
    }   
}
