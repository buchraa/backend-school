// src/students/dto/create-student.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;


  @IsNotEmpty()
  @IsInt()
  parentId: number;
}
