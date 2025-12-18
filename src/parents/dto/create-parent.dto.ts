// src/parents/dto/create-parent.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateParentDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
