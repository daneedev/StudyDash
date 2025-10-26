import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password of the user',
    example: 'securepassword',
  })
  password: string;
}

export class RegisterDto extends AuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john_doe@example.com',
  })
  email: string;
}
