import { HttpException, Injectable } from '@nestjs/common';
import { AuthDto, UpdateUserDto } from 'src/dto';
import UserModel from 'src/models/user.model';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize/lib/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}
  async updateUserProfile(dto: UpdateUserDto, user: any) {
    const { currentPassword, newPassword, email, username } = dto;
    const findUser = await UserModel.findByPk(user.id);
    if (!findUser) {
      throw new HttpException('User not found', 404);
    }
    if (
      currentPassword &&
      !bcrypt.compareSync(currentPassword, findUser.password)
    ) {
      throw new HttpException('Current password is incorrect', 401);
    }
    if (newPassword && newPassword.length < 8) {
      throw new HttpException(
        'New password must be at least 8 characters long',
        400,
      );
    }
    const existingUser = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: dto.email }, { username: dto.username }],
      },
    });
    if (existingUser) {
      const field = existingUser.email === dto.email ? 'email' : 'username';
      throw new HttpException(`${field} is already taken`, 409);
    }
    if (email) {
      findUser.email = email;
    }
    if (username) {
      findUser.username = username;
    }
    if (newPassword) {
      findUser.password = bcrypt.hashSync(newPassword, 10);
    }
    await findUser.save();
    const { password, ...userWithoutPassword } = findUser.dataValues;
    const payload = {
      id: findUser.id,
      username: findUser.username,
      email: findUser.email,
    };
    const token = await this.jwtService.signAsync(payload);

    return { user: userWithoutPassword, token };
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
