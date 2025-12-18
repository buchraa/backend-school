import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AssignTeachersDto {
  @ApiProperty({ example: [10, 11] })
  @IsArray()
  @IsInt({ each: true })
  teacherIds: number[];
}
