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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ClassesGuard } from 'src/classes/classes.guard';
import { CreateSubjectDto } from 'src/dto';

@Controller('subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard, ClassesGuard)
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  @Get('/:classId')
  getSubjectsByClassId(@Param('classId') id: string) {
    return this.subjectsService.getSubjectsByClassId(id);
  }

  @Post('/')
  createSubject(@Body() body: CreateSubjectDto) {
    return this.subjectsService.createSubject(body);
  }

  @Patch('/:id')
  editSubject(@Param('id') id: string, @Body() body: { name: string }) {
    return this.subjectsService.editSubject(id, body.name);
  }

  @Delete('/:id')
  deleteSubject(@Param('id') id: string) {
    return this.subjectsService.deleteSubject(id);
  }
}
