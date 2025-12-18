// src/classes/dto/assign-students.dto.ts
import { IsArray, IsInt } from 'class-validator';

export class AssignStudentsDto {
  @IsArray()
  @IsInt({ each: true })
  studentIds: number[];
}
