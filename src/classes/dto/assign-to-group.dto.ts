import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class AssignToGroupDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  childIds: number[];
}
