import { IsOptional, IsArray } from "class-validator";

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

  submit?: boolean;
}
