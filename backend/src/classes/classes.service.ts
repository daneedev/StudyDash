import { HttpException, Injectable } from "@nestjs/common";
import { ClassDto } from "src/dto";
import ClassModel from "src/models/class.model";
import ClassUserModel from "src/models/classuser.model";
import UserModel from "src/models/user.model";
import { generateInviteCode } from "src/utils/inviteGen";

@Injectable()
export class ClassesService {
    async createClass(dto: ClassDto, user: any) {
        const newClass = await ClassModel.create({
            name: dto.name,
            inviteCode: generateInviteCode(8)
        })
        const newClassUser = await ClassUserModel.create({
            classId: newClass.id,
            userId: user.id,
            role: 'admin'
        })
        return { class: newClass, classUser: newClassUser };
    }

    async getAllUserClasses(user: any) {
        const classUsers = await ClassUserModel.findAll({
            where: { userId: user.id },
        });
        const userClasses = classUsers.map(async (classUser) => {
            const classInfo = await ClassModel.findByPk(classUser.classId);
            return {
                class: {...classInfo?.get(), inviteCode: undefined},
                role: classUser.role,
            };
        });
        return Promise.all(userClasses);
    }

    async getClassById(classId: number) {
        const classInfo = await ClassModel.findByPk(classId);
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        const classUsers = await ClassUserModel.findAll({
            where: { classId: classId },
        });
        const members = classUsers.map(async (classUser) => {
            const user = await UserModel.findByPk(classUser.userId);
            return {
                username: user?.username,
                id: user?.id,
                role: classUser.role,
            };
        });
        return {
            ...classInfo.get(),
            inviteCode: undefined,
            members: await Promise.all(members),
        };
    }

    async updateClass(dto: ClassDto, classId: number) {
        const classInfo = await ClassModel.findByPk(classId);
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        classInfo.name = dto.name || classInfo.name;
        await classInfo.save();
        return { ...classInfo.get(), inviteCode: undefined };
    }
    async deleteClass(classId: number) {
        const classInfo = await ClassModel.findByPk(classId);
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        const classUsers = await ClassUserModel.findAll({
            where: { classId: classId },
        });
        for (const classUser of classUsers) {
            await classUser.destroy();
        }
        await classInfo.destroy();
        return { message: 'Class deleted successfully' };
    }

}