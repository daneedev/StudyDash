import { HttpException, Injectable } from "@nestjs/common";
import { ClassDto } from "src/dto";
import { generateInviteCode } from "src/utils/inviteGen";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}
    async createClass(dto: ClassDto, user: any) {
        const newClass = await this.prisma.class.create({
            data: {
                name: dto.name,
                inviteCode: generateInviteCode(8)
            }
        })
        const newClassUser = await this.prisma.classUser.create({
            data: {
                classId: newClass.id,
                userId: user.id,
                role: 'admin'
            }
        })
        return { class: newClass, classUser: newClassUser };
    }

    async getAllUserClasses(user: any) {
        const classUsers = await this.prisma.classUser.findMany({
            where: { userId: user.id },
        });
        const userClasses = classUsers.map(async (classUser) => {
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classUser.classId },
            });
            return {
                class: {...classInfo, inviteCode: undefined},
                role: classUser.role,
            };
        });
        return Promise.all(userClasses);
    }

    async getClassById(classId: string) {
        const classInfo = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        const classUsers = await this.prisma.classUser.findMany({
            where: { classId: classId },
        });
        const members = classUsers.map(async (classUser) => {
            const user = await this.prisma.user.findUnique({
                where: { id: classUser.userId },
            });
            return {
                username: user?.username,
                id: user?.id,
                role: classUser.role,
            };
        });
        return {
            ...classInfo,
            inviteCode: undefined,
            members: await Promise.all(members),
        };
    }

    async updateClass(dto: ClassDto, classId: string) {
        const classInfo = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        const updatedClass = await this.prisma.class.update({
            where: { id: classId },
            data: {
                name: dto.name || classInfo.name,
            },
        });
        return { ...updatedClass, inviteCode: undefined };
    }
    async deleteClass(classId: string) {
        const classInfo = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classInfo) {
            throw new HttpException('Class not found', 404);
        }
        const classUsers = await this.prisma.classUser.findMany({
            where: { classId: classId },
        });
        for (const classUser of classUsers) {
            await this.prisma.classUser.delete({
                where: { id: classUser.id },
            });
        }
        await this.prisma.class.delete({
            where: { id: classId },
        });
        return { message: 'Class deleted successfully' };
    }

}