import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the subject',
    example: 'Algebra',
  })
  name: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the class the subject belongs to',
    example: 'UUID of the class',
  })
  classId: string;
}
