import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesService } from './files.service';
import sanitize from 'sanitize-filename';

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
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found',
  })
  getFilesByNoteId(@Param('noteId') noteId: string, @Req() req) {
    return this.filesService.getFilesByNoteId(sanitize(noteId), req.user.id);
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
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., missing file, file too large)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found',
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param('noteId') noteId: string,
  ) {
    return this.filesService.uploadFile(file, req.user.id, sanitize(noteId));
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
  @ApiResponse({
    status: 200,
    description: 'File metadata updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., missing name, invalid file ID)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  updateFileMetadata(
    @Param('fileId') fileId: string,
    @Req() req,
    @Body() body: { name: string },
  ) {
    return this.filesService.updateFileMetadata(
      sanitize(fileId),
      req.user.id,
      body.name,
    );
  }

  @Delete('/:fileId')
  @ApiOperation({ summary: 'Delete a file attachment' })
  @ApiParam({
    name: 'fileId',
    description: 'ID of the file to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  deleteFile(@Param('fileId') fileId: string, @Req() req) {
    return this.filesService.deleteFile(sanitize(fileId), req.user.id);
  }

  @Get('/:fileId/download')
  @ApiOperation({ summary: 'Download a file attachment' })
  @ApiProduces('application/octet-stream')
  @ApiParam({
    name: 'fileId',
    description: 'ID of the file to download',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async downloadFile(@Param('fileId') fileId: string, @Req() req, @Res() res) {
    const file = await this.filesService.downloadFile(
      sanitize(fileId),
      req.user.id,
    );
    return res.download(file.filePath, file.originalName);
  }
}
