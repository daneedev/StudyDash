import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the class',
    example: 'Math 101',
  })
  name: string;
}
