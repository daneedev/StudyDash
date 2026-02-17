import { HttpException, Injectable } from '@nestjs/common';
import { CreateAssignmentDto, UpdateAssignmentDto } from 'src/dto/index';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) {}
    async getAssignmentsByClass(classId: string) {
        const assignments = await this.prisma.assignment.findMany({
            where: { classId },
        });
        if (!assignments) {
            throw new HttpException('Class not found', 404);
        }
        return assignments;
    }
    async createAssignment(createAssignmentDto: CreateAssignmentDto, user: any) {
        const classUser = await this.prisma.classUser.findUnique({
            where: { classId_userId: { classId: createAssignmentDto.classId, userId: user.id } },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        const classNotFound = await this.prisma.class.findUnique({
            where: { id: createAssignmentDto.classId },
        });
        if (!classNotFound) {
            throw new HttpException('Class not found', 404);
        }
        const newAssignment = await this.prisma.assignment.create({
            data: {
                ...createAssignmentDto,
                authorId: user.id,
            },
        });
        return newAssignment;
    }
    async updateAssignment(id: string, updateAssignmentDto: UpdateAssignmentDto, user: any) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new HttpException('Assignment not found', 404);
        }
        const classNotFound = await this.prisma.class.findUnique({
            where: { id: assignment.classId },
        });
        if (!classNotFound) {
            throw new HttpException('Class not found', 404);
        }
        const classUser = await this.prisma.classUser.findUnique({
            where: { classId_userId: { classId: assignment.classId, userId: user.id } },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        
        // Destructure to exclude protected fields
        const { authorId, classId, ...safeUpdates } = updateAssignmentDto as any;
        
        const updatedAssignment = await this.prisma.assignment.update({
            where: { id },
            data: safeUpdates,
        });
        return updatedAssignment;
    }
    async deleteAssignment(id: string, user: any) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new HttpException('Assignment not found', 404);
        }
        const classUser = await this.prisma.classUser.findUnique({
            where: { classId_userId: { classId: assignment.classId, userId: user.id } },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        await this.prisma.assignment.delete({
            where: { id },
        });
        return { message: 'Assignment deleted successfully' };
    }
}
