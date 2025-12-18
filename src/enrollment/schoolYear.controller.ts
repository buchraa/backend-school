import { Controller, Get } from "@nestjs/common";
import { SchoolYearService } from "src/schoolYear/schoolYear.service";

@Controller('school-years')
export class SchoolYearController {
  constructor(private readonly svc: SchoolYearService) {}

  @Get('active')
  getActive() {
    return this.svc.getActiveYear();
  }
}
