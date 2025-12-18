// src/classes/dto/create-class-group.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsArray,
  IsInt as IsIntEach,
} from 'class-validator';

export class CreateClassGroupDto {
  @IsNotEmpty()
  @IsString()
  code: string; // "CP-A"

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  level?: string; // "CP", "CE1", etc.

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsArray()
  @IsIntEach({ each: true })
  teacherIds?: number[];
}
