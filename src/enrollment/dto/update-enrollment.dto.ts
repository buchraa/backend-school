import { Type } from "class-transformer";
import { IsOptional, IsArray, IsBoolean } from "class-validator";

export class UpdateEnrollmentDto {
     @IsOptional()
  @IsArray() 
  existingChildren?: {
    enrollmentChildId: number;
    desiredLevel?: string;
    notes?: string;
  } [];

    @IsOptional()
  @IsArray()
  newChildren?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    desiredLevel: string;
    notes?: string;
  } [];

    @IsOptional()
    @IsBoolean()
    @Type(() =>Boolean)
  submit?: boolean;
}
