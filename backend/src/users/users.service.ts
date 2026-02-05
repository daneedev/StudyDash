import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDto, UpdateUserDto } from 'src/dto';
import UserModel from 'src/models/user.model';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}
  async updateUserProfile(dto: UpdateUserDto, user: any) {
    const findUser = await UserModel.findByPk(user.id);
    if (!findUser) {
      throw new HttpException('User not found', 404);
    }
    
    // Verify current password before allowing updates
    if (!bcrypt.compareSync(dto.currentPassword, findUser.password)) {
      throw new HttpException('Current password is incorrect', 401);
    }
    
    // Only update allowed fields explicitly
    const updates: any = {};
    if (dto.username) updates.username = dto.username;
    if (dto.email) updates.email = dto.email;
    if (dto.newPassword) {
      updates.password = bcrypt.hashSync(dto.newPassword, 10);
    }
    
    await findUser.update(updates);

    const payload = { id: findUser.id, username: findUser.username, email: findUser.email };
    const token = this.jwtService.sign(payload);
    return { user: findUser, token  };
  }

  async deleteUserProfile(dto: AuthDto, user: any) {
    const { username, password } = dto;
    const findUser = await UserModel.findByPk(user.id);
    if (!findUser) {
      throw new HttpException('User not found', 404);
    }
    if (findUser.username !== username) {
      throw new HttpException('Username does not match', 401);
    }
    if (!bcrypt.compareSync(password, findUser.password)) {
      throw new HttpException('Password is incorrect', 401);
    }
    await findUser.destroy();
    return { message: 'User deleted successfully' };
  }
}
