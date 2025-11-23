import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentpassword',
  })
  currentPassword: string;
  @IsString()
  @ApiProperty({
    description: 'New password of the user',
    example: 'newpassword',
  })
  newPassword?: string;
  @IsEmail()
  @ApiProperty({
    description: 'New email of the user',
    example: 'user@example.com',
  })
  email?: string;
  @IsString()
  @ApiProperty({
    description: 'New username of the user',
    example: 'username',
  })
  username?: string;
}
