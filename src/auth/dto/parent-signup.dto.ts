import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ParentSignupDto {
  @IsNotEmpty()
  familyCode: string;

  @IsNotEmpty()
  phone: string; // le parent le saisit

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
