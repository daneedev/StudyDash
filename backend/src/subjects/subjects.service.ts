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

  async createSubject(body: CreateSubjectDto) {
    const newSubject = await this.prisma.subject.create({
        data: {
            name: body.name,
            classId: body.classId
        }
    })
    return newSubject;
  }

  async editSubject(subjectId: string, name: string) {
    const updatedSubject = await this.prisma.subject.update({
        where: { id: subjectId },
        data: { name }
    })
    return updatedSubject;
  }

  async deleteSubject(subjectId: string) {
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
