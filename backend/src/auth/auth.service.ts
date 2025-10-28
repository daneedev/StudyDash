import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDto, RegisterDto } from 'src/dto';
import UserModel from 'src/models/user.model';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from 'src/types/api.types';
import { Op } from 'sequelize';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(dto: AuthDto) {
    const user = await UserModel.findOne({
      where: { username: dto.username },
    });
    if (!user || !bcrypt.compareSync(dto.password, user.password)) {
      throw new HttpException(
        `Invalid username or password`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: user.id, username: user.username, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(dto: RegisterDto): Promise<ApiResponse<UserModel>> {
    const existingUser = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === dto.email ? 'email' : 'username';
      throw new HttpException(
        `User with this ${field} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    if (dto.password.length < 8) {
      throw new HttpException(
        `Password must be at least 8 characters long`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = await UserModel.create({
      username: dto.username,
      email: dto.email,
      password: bcrypt.hashSync(dto.password, 10),
    });

    const { password, ...userWithoutPassword } = newUser.dataValues;
    return userWithoutPassword;
  }
}
