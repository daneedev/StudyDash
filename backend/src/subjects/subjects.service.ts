import { HttpException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) {}

  async getSubjectsByClassId(classId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { classId },
    });
    return subjects;
  }

  async createSubject(body: CreateSubjectDto, userId: string) {
    const isInClass = await this.prisma.classUser.findFirst({
        where: {
            classId: body.classId,
            userId: userId,
        },
    });
    if (!isInClass) {
        throw new HttpException('User is not part of the class', 403);
    }
    const newSubject = await this.prisma.subject.create({
        data: {
            name: body.name,
            classId: body.classId
        }
    })
    return newSubject;
  }

  async editSubject(subjectId: string, name: string, userId: string) {
    const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
    });
    if (!subject) {
        throw new HttpException('Subject not found', 404);
    }
    const isInClass = await this.prisma.classUser.findFirst({
        where: {
            classId: subject.classId,
            userId: userId,
        },
    });
    if (!isInClass) {
        throw new HttpException('User is not part of the class', 403);
    }
    const updatedSubject = await this.prisma.subject.update({
        where: { id: subjectId },
        data: { name }
    })
    return updatedSubject;
  }

  async deleteSubject(subjectId: string, userId: string) {
    const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
    });
    if (!subject) {
        throw new HttpException('Subject not found', 404);
    }
    const isInClass = await this.prisma.classUser.findFirst({
        where: {
            classId: subject.classId,
            userId: userId,
        },
    });
    if (!isInClass) {
        throw new HttpException('User is not part of the class', 403);
    }
    const assignments = await this.prisma.assignment.findMany({
        where: { subjectId },
    });
    if (assignments.length > 0) {
        throw new HttpException('Cannot delete subject with existing assignments', 400);
    }
    await this.prisma.subject.delete({
        where: { id: subjectId },
    });
    return { message: 'Subject deleted successfully' };
  }
}
