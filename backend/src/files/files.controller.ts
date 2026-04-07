import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesService } from './files.service';

@UseGuards(AuthGuard)
@Controller('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:noteId')
  @ApiOperation({ summary: 'Get files by note ID' })
  @ApiParam({
    name: 'noteId',
    description: 'ID of the note to retrieve files for',
  })
  getFilesByNoteId(@Param('noteId') noteId: string, @Req() req) {
    return this.filesService.getFilesByNoteId(noteId, req.user.id);
  }

  @Post('/:noteId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file attachment to a note' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File attachment to upload',
        },
      },
    },
  })
  @ApiParam({
    name: 'noteId',
    description: 'ID of the note to attach the file to',
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param('noteId') noteId: string,
  ) {
    return this.filesService.uploadFile(file, req.user.id, noteId);
  }

  @Patch('/:fileId')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiParam({
    name: 'fileId',
    description: 'ID of the file to update',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'New name for the file (without extension)',
          example: 'Updated File Name',
        },
      },
    },
  })
  updateFileMetadata(
    @Param('fileId') fileId: string,
    @Req() req,
    @Body() body: { name: string },
  ) {
    return this.filesService.updateFileMetadata(fileId, req.user.id, body.name);
  }

  @Delete('/:fileId')
  @ApiOperation({ summary: 'Delete a file attachment' })
  @ApiParam({
    name: 'fileId',
    description: 'ID of the file to delete',
  })
  deleteFile(@Param('fileId') fileId: string, @Req() req) {
    return this.filesService.deleteFile(fileId, req.user.id);
  }
}
