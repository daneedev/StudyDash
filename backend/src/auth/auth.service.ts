import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/dto';
import UserModel from 'src/models/user.model';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from 'src/types/api.types';
import { Op } from 'sequelize';

@Injectable({})
export class AuthService {
  login() {
    return 'User logged in';
  }

  async register(dto: RegisterDto): Promise<ApiResponse<UserModel>> {
    const existingUser = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      console.log(existingUser.email, dto.email);
      const field = existingUser.email === dto.email ? 'email' : 'username';
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.CONFLICT,
          error: `Conflict`,
          message: `User with this ${field} already exists`,
        },
        HttpStatus.CONFLICT,
      );
    }

    if (dto.password.length < 8) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          error: `Bad Request`,
          message: `Password must be at least 8 characters long`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = await UserModel.create({
      username: dto.username,
      email: dto.email,
      password: bcrypt.hashSync(dto.password, 10),
    });

    const { password, ...userWithoutPassword } = newUser.dataValues;
    return {
      success: true,
      statusCode: 201,
      data: userWithoutPassword as UserModel,
    };
  }
}
