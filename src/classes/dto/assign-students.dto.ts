// src/classes/dto/assign-students.dto.ts
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AssignStudentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  childIds: number[];
}
