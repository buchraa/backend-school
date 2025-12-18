import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupAdminDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
