import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';
import path from 'path';
import fs from 'fs';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  private repairFileNameEncoding(fileName: string): string {
    // Some clients send UTF-8 filename bytes interpreted as latin1 by multipart parsers.
    if (!/[\u0080-\u009fÃÅ]/.test(fileName)) {
      return fileName;
    }

    const repaired = Buffer.from(fileName, 'latin1').toString('utf8');
    return repaired || fileName;
  }

  async uploadFile(file: Express.Multer.File, userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { subjectId: true },
    });
    if (!note) {
      throw new HttpException('Note not found', 404);
    }

    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              notes: {
                some: {
                  id: noteId,
                },
              },
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to note denied', 403);
    }

    const sanitizedOriginalName = this.repairFileNameEncoding(
      file.originalname,
    );

    const newFile = await this.prisma.file.create({
      data: {
        originalName: sanitizedOriginalName,
        size: file.size,
        noteId,
        mimetype: file.mimetype,
      },
    });

    const fileDir = path.join(
      process.cwd(),
      `../${process.env.UPLOAD_DIR}/${note.subjectId}/${noteId}`,
    );
    fs.mkdirSync(fileDir, { recursive: true });
    const filePath = path.join(
      fileDir,
      newFile.id + path.extname(file.originalname),
    );
    fs.writeFileSync(filePath, file.buffer);

    return { message: 'File uploaded successfully', file: newFile };
  }

  async getFilesByNoteId(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { subjectId: true },
    });
    if (!note) {
      throw new HttpException('Note not found', 404);
    }

    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              notes: {
                some: {
                  id: noteId,
                },
              },
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to note denied', 403);
    }
    const files = await this.prisma.file.findMany({
      where: { noteId },
    });
    return files;
  }

  async updateFileMetadata(fileId: string, userId: string, name: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        originalName: true,
      },
    });
    if (!file) {
      throw new HttpException('File not found', 404);
    }

    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              notes: {
                some: {
                  files: {
                    some: { id: fileId },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to file denied', 403);
    }

    const updatedFile = await this.prisma.file.update({
      where: { id: fileId },
      data: { originalName: name + path.extname(file.originalName) },
    });
    return updatedFile;
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        originalName: true,
        note: {
          select: {
            id: true,
            subjectId: true,
          },
        },
      },
    });
    if (!file) {
      throw new HttpException('File not found', 404);
    }

    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              notes: {
                some: {
                  files: {
                    some: { id: fileId },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to file denied', 403);
    }

    await this.prisma.file.delete({
      where: { id: fileId },
    });
    const filePath = path.join(
      process.cwd(),
      `../${process.env.UPLOAD_DIR}/${file.note.subjectId}/${file.note.id}/${fileId}${path.extname(file.originalName)}`,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { message: 'File deleted successfully' };
  }
}
