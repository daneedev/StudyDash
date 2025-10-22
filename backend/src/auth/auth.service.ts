import { Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/dto';
import UserModel from 'src/models/user.model';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from 'src/types/api.types';

@Injectable({})
export class AuthService {
  login() {
    return 'User logged in';
  }

  async register(dto: RegisterDto): Promise<ApiResponse<UserModel>> {
    if (await UserModel.findOne({ where: { email: dto.email } })) {
      return {
        success: false,
        statusCode: 409,
        error: 'Email již existuje',
      };
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
      data: userWithoutPassword,
    };
  }
}
