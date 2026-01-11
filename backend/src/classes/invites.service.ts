import { Injectable } from "@nestjs/common";

@Injectable()
export class InvitesService {
    getInviteCode(classId: number) {
        // Implementation will go here
    }

    joinClassViaInviteCode(inviteCode: string, user: any) {
        // Implementation will go here
    }
    leaveClass(classId: number, user: any) {
        // Implementation will go here
    }
    regenerateInviteCode(classId: number) {
        // Implementation will go here
    }
}