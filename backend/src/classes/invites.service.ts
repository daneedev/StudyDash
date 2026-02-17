import { HttpException, Injectable } from "@nestjs/common";
import { generateInviteCode } from "src/utils/inviteGen";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class InvitesService {
    constructor(private prisma: PrismaService) {}
    async getInviteCode(classId: string) {
        const classInstance = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classInstance) {
            throw new HttpException("Class not found", 404);
        }
        return classInstance.inviteCode;
    }

    async joinClassViaInviteCode(inviteCode: string, user: any) {
        const classInstance = await this.prisma.class.findUnique({
            where: { inviteCode },
        });
        if (!classInstance) {
            throw new HttpException("Invalid invite code", 404);
        }
        const existingMembership = await this.prisma.classUser.findUnique({
            where: { classId_userId: { classId: classInstance.id, userId: user.id } },
        });
        if (existingMembership) {
            throw new HttpException("User is already a member of this class", 400);
        }
        const classUser = await this.prisma.classUser.create({
            data: {
                classId: classInstance.id,
                userId: user.id,
                role: "member",
            },
        });
        return classUser;
    }
    async leaveClass(classId: string, user: any) {
        const classUser = await this.prisma.classUser.findUnique({
            where: { classId_userId: { classId, userId: user.id } },
        });
        if (!classUser) {
            throw new HttpException("User is not a member of this class", 404);
        }
        await this.prisma.classUser.delete({
            where: { id: classUser.id },
        });
        return { message: "Successfully left the class" };
    }
    async regenerateInviteCode(classId: string) {
        const classInstance = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classInstance) {
            throw new HttpException("Class not found", 404);
        }
        const newInviteCode = generateInviteCode();
        await this.prisma.class.update({
            where: { id: classId },
            data: { inviteCode: newInviteCode },
        });
        return newInviteCode;
    }
}