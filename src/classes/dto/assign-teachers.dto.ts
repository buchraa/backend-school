// src/classes/dto/assign-teachers.dto.ts
import { IsArray, IsInt } from 'class-validator';

export class AssignTeachersDto {
  @IsArray()
  @IsInt({ each: true })
  teacherIds: number[];
}
