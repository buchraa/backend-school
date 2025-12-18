import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  familyCode: string; // ex: "F25-001"

  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsInt()
  month: number; // 1-12

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string; // ex "2025-02-10"

  @IsOptional()
  @IsString()
  reference?: string;
}
