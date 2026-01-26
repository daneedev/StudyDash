import { HttpException, Injectable } from "@nestjs/common";
import ClassModel from "src/models/class.model";
import ClassUserModel from "src/models/classuser.model";
import { generateInviteCode } from "src/utils/inviteGen";

@Injectable()
export class InvitesService {
    async getInviteCode(classId: number) {
        const classInstance = await ClassModel.findByPk(classId);
        if (!classInstance) {
            throw new HttpException("Class not found", 404);
        }
        return classInstance.inviteCode;
    }

    async joinClassViaInviteCode(inviteCode: string, user: any) {
        const classInstance = await ClassModel.findOne({ where: { inviteCode } });
        if (!classInstance) {
            throw new HttpException("Invalid invite code", 404);
        }
        const classUser = await ClassUserModel.create({
            classId: classInstance.id,
            userId: user.id,
            role: "member",
        });
        return classUser;
    }
    async leaveClass(classId: number, user: any) {
        const classUser = await ClassUserModel.findOne({ where: { classId, userId: user.id } });
        if (!classUser) {
            throw new HttpException("User is not a member of this class", 404);
        }
        await classUser.destroy();
        return { message: "Successfully left the class" };
    }
    async regenerateInviteCode(classId: number) {
        const classInstance = await ClassModel.findByPk(classId);
        if (!classInstance) {
            throw new HttpException("Class not found", 404);
        }
        const newInviteCode = generateInviteCode();
        classInstance.inviteCode = newInviteCode;
        await classInstance.save();
        return newInviteCode;
    }
}