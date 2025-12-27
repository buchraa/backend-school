import { Controller, Post } from '@nestjs/common';
import { ImportParentsService } from './import-parents.service';

@Controller('admin/import')
export class ImportParentsController {
  constructor(
    private readonly importService: ImportParentsService,
  ) {}

  @Post('parents')
  async importParents() {
   const result  = await this.importService.importFromExcel('2025-26.xlsx');
   return {sucess: true, ...result};
  }
}
