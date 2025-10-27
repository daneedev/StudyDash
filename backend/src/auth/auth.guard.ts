import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(request.headers);
    if (!token || type !== 'Bearer') {
      throw new HttpException('Invalid or missing authorization token', 401);
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'default_secret',
      });

      request.user = payload;
    } catch (error) {
      throw new HttpException('IInvalid or missing authorization token', 401);
    }

    return true;
  }
}
