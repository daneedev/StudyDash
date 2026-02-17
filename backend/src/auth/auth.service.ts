import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthDto, RegisterDto } from 'src/dto';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from 'src/types/api.types';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
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

  async register(dto: RegisterDto){
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: dto.username } },
          { email: { equals: dto.email } },
        ],
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

    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: bcrypt.hashSync(dto.password, 10),
      },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}
