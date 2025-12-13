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
    
    findUser.username = dto.username || findUser.username;
    findUser.email = dto.email || findUser.email;
    findUser.password = bcrypt.hashSync(
      dto.newPassword || dto.currentPassword,
      10,
    );
    await findUser.save();

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
