import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;
}
