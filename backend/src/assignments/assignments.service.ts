import { HttpException, Injectable } from '@nestjs/common';
import AssignmentModel from 'src/models/assignment.model';
import { CreateAssignmentDto, UpdateAssignmentDto } from 'src/dto/index';
import ClassUserModel from 'src/models/classuser.model';
import ClassModel from 'src/models/class.model';

@Injectable()
export class AssignmentsService {
    async getAssignmentsByClass(classId: number) {
        const assignments = await AssignmentModel.findAll({ where: { classId } });
        if (!assignments) {
            throw new HttpException('Class not found', 404);
        }
        return assignments;
    }
    async createAssignment(createAssignmentDto: CreateAssignmentDto, user: any) {
        const classUser = await ClassUserModel.findOne({
            where: { classId: createAssignmentDto.classId, userId: user.id },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        const classNotFound = await ClassModel.findByPk(createAssignmentDto.classId);
        if (!classNotFound) {
            throw new HttpException('Class not found', 404);
        }
       const newAssignment = await AssignmentModel.create({
            ...createAssignmentDto,
            addedBy: user.id,
        });
        return newAssignment;
    }
    async updateAssignment(id: number, updateAssignmentDto: UpdateAssignmentDto, user: any) {
        const assignment = await AssignmentModel.findByPk(id);
        if (!assignment) {
            throw new HttpException('Assignment not found', 404);
        }
        const classNotFound = await ClassModel.findByPk(assignment.classId);
        if (!classNotFound) {
            throw new HttpException('Class not found', 404);
        }
        const classUser = await ClassUserModel.findOne({
            where: { classId: assignment.classId, userId: user.id },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        
        // Destructure to exclude protected fields
        const { addedBy, classId, ...safeUpdates } = updateAssignmentDto as any;
        
        await assignment.update(safeUpdates);
        return assignment;
    }
    async deleteAssignment(id: number, user: any) {
        const assignment = await AssignmentModel.findByPk(id);
        if (!assignment) {
            throw new HttpException('Assignment not found', 404);
        }
        const classUser = await ClassUserModel.findOne({
            where: { classId: assignment.classId, userId: user.id },
        });
        if (!classUser) {
            throw new HttpException('Access to class denied', 403);
        }
        await assignment.destroy();
        return { message: 'Assignment deleted successfully' };
    }
}
