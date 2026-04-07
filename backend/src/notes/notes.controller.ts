import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateNoteDto, UpdateNoteDto } from 'src/dto/index';
import { NotesService } from './notes.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('notes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private notesService: NotesService) {}
  @ApiOperation({ summary: 'Get notes by subject ID' })
  @ApiResponse({ status: 200, description: 'Return notes by subject ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Get('/:subjectId')
  getNotesBySubject(@Param('subjectId') subjectId: string, @Req() req) {
    return this.notesService.getNotesBySubject(subjectId, req.user.id);
  }

  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Post()
  createNote(@Body() createNoteDto: CreateNoteDto, @Req() req) {
    return this.notesService.createNote(req.user.id, createNoteDto);
  }

  @ApiOperation({ summary: 'Update an existing note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @Patch('/:noteId')
  updateNote(
    @Param('noteId') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() req,
  ) {
    return this.notesService.updateNote(noteId, req.user.id, updateNoteDto);
  }

  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @Delete('/:noteId')
  deleteNote(@Param('noteId') noteId: string, @Req() req) {
    return this.notesService.deleteNote(noteId, req.user.id);
  }
}
