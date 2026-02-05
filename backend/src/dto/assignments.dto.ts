import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAssignmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsNotEmpty()
    subject: string;
    @IsString()
    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    @IsDateString()
    dueDate: Date;
    @IsNotEmpty()
    @IsNumber()
    classId: number;
    @IsNotEmpty()
    @IsEnum(['homework', 'exam'])
    type: 'homework' | 'exam';
}