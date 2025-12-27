import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImportParentsService } from "src/parents/import/import-parents.service";

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(ImportParentsService);

  await service.importFromExcel('Liste élèves 2025-26.xlsx');
  console.log('Import terminé');
  process.exit(0);
}

run();
