import { HttpException, Injectable } from '@nestjs/common';
import { CreateNoteDto, UpdateNoteDto } from 'src/dto/notes.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotesService {
  private prisma: PrismaService;
  constructor() {
    this.prisma = new PrismaService();
  }
  async getNotesBySubject(subjectId: string, userId: string) {
    const notes = await this.prisma.note.findMany({
      where: { subjectId },
    });
    if (!notes) {
      throw new HttpException('Subject not found', 404);
    }
    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              id: subjectId,
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to subject denied', 403);
    }
    return notes;
  }
  async createNote(userId: string, body: CreateNoteDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: body.subjectId },
    });
    if (!subject) {
      throw new HttpException('Subject not found', 404);
    }
    const isInClass = await this.prisma.classUser.findFirst({
      where: {
        userId,
        class: {
          subjects: {
            some: {
              id: body.subjectId,
            },
          },
        },
      },
    });
    if (!isInClass) {
      throw new HttpException('Access to subject denied', 403);
    }
    const newNote = await this.prisma.note.create({
      data: {
        name: body.name,
        content: body.content,
        subjectId: body.subjectId,
        authorId: userId,
      },
    });
    return newNote;
  }

  async updateNote(noteId: string, userId: string, body: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
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
    const updatedNote = await this.prisma.note.update({
      where: { id: noteId },
      data: body,
    });
    return updatedNote;
  }

  async deleteNote(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
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
    await this.prisma.note.delete({
      where: { id: noteId },
    });
  }
}
