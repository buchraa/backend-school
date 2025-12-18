import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupParentDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
