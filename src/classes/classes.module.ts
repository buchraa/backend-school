// src/classes/classes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { ClassGroup } from './entities/class-group.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { EnrollmentChild } from 'src/enrollment/entities/enrollment-child.entity';
import { EnrollmentRequest } from 'src/enrollment/entities/enrollment-request.entity';
import { Parent } from 'src/parents/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, ClassGroup, Teacher, Student, EnrollmentChild, EnrollmentRequest,])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
