// src/parents/dto/update-parent.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateParentDto } from './create-parent.dto';

import { IsOptional, IsString } from 'class-validator';

export class UpdateParentDto {
  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;
}
// export class UpdateParentDto extends PartialType(CreateParentDto) {}
