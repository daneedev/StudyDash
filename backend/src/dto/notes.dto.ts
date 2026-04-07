import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the note',
    example: 'Math Homework 1',
  })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Subject ID of the assignment',
    example: 'UUID of the subject',
  })
  subjectId: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Content of the note',
    example:
      'This is the content of the note. JSON format can be used for rich text.',
  })
  content: string;
}

export class UpdateNoteDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the note',
    example: 'Math Homework 1',
  })
  name?: string;
  @IsString()
  @ApiProperty({
    description: 'Content of the note',
    example:
      'This is the content of the note. JSON format can be used for rich text.',
  })
  content?: string;
}
