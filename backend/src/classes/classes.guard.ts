import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import ClassUserModel from 'src/models/classuser.model';

@Injectable()
export class ClassesGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const classId = request.params.id;
    const classUser = await ClassUserModel.findOne({
      where: { classId: classId, userId: user.id },
    });
    if (!classUser) {
      throw new HttpException('Access to class denied', 403);
    }

    return true;
  }
}

@Injectable()
export class ClassesAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const classId = request.params.id;
        const classUser = await ClassUserModel.findOne({
            where: { classId: classId, userId: user.id },
        });
        if (!classUser || classUser.role !== 'admin') {
            throw new HttpException('Admin access to class denied', 403);
        }
        return true;
    }
}