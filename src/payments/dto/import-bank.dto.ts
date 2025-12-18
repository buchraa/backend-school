
import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BankPaymentLineDto {
  @IsString()
  reference: string; // libellé du virement

  @IsNumber()
  amount: number;

  @IsString()
  date: string; // "2025-02-10"
}

export class ImportBankDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankPaymentLineDto)
  lines: BankPaymentLineDto[];
}
