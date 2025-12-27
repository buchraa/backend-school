// src/parents/parents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { ImportParentsService } from './import/import-parents.service';
import { Student } from '../students/entities/student.entity';
import { ClassGroup } from '../classes/entities/class-group.entity';
import { ImportParentsController } from './import/import-parents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Student, ClassGroup])],
  controllers: [ParentsController, ImportParentsController],
  providers: [ParentsService, ImportParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
