import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  IsInt,
} from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)             // 👈 transforme les strings JSON en number
  @IsInt({ each: true })
  subjectIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)             // 👈 idem
  @IsInt({ each: true })
  classGroupIds?: number[];
}
