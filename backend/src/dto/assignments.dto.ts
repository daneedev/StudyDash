import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAssignmentDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Name of the assignment',
        example: 'Math Homework 1',
    })
    name: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Subject of the assignment',
        example: 'Mathematics',
    })
    subject: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Description of the assignment',
        example: 'Complete all exercises from chapter 1',
    })
    description: string;
    @IsNotEmpty()
    @IsDateString()
    @ApiProperty({
        description: 'Due date of the assignment',
        example: '2024-12-31T23:59:59Z',
    })
    dueDate: Date;
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'ID of the class the assignment belongs to',
        example: 1,
    })
    classId: number;
    @IsNotEmpty()
    @IsEnum(['homework', 'exam'])
    @ApiProperty({
        description: 'Type of the assignment (“homework” or “exam”)',
        example: 'homework',
    })
    type: 'homework' | 'exam';
}

export class UpdateAssignmentDto {
    @IsString()
    @ApiProperty({
        description: 'Name of the assignment',
        example: 'Math Homework 1',
    })
    name?: string;
    @IsString()
    @ApiProperty({
        description: 'Subject of the assignment',
        example: 'Mathematics',
    })
    subject?: string;
    @IsString()
    @ApiProperty({
        description: 'Description of the assignment',
        example: 'Complete all exercises from chapter 1',
    })
    description?: string;
    @IsDateString()
    @ApiProperty({
        description: 'Due date of the assignment',
        example: '2024-12-31T23:59:59Z',
    })
    dueDate?: Date;
    @IsEnum(['homework', 'exam'])
    @ApiProperty({
        description: 'Type of the assignment (“homework” or “exam”)',
        example: 'homework',
    })
    type?: 'homework' | 'exam';
}