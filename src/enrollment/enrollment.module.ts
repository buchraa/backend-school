import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { EnrollmentRequest } from './entities/enrollment-request.entity';
import { EnrollmentChild } from './entities/enrollment-child.entity';
import { SchoolYear } from 'src/schoolYear/entities/school-year.entity';
import { ParentsModule } from 'src/parents/parents.module';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Parent } from 'src/parents/entities/parent.entity';
import { User } from 'src/users/entities/user.entity';
import { StudentsModule } from 'src/students/students.module';
import { UsersModule } from 'src/users/users.module';
import { SchoolYearService } from 'src/schoolYear/schoolYear.service';
import { SchoolYearController } from './schoolYear.controller';
import { ClassGroup } from 'src/classes/entities/class-group.entity';
import { ClassesModule } from 'src/classes/classes.module';

@Module({
imports: [
  TypeOrmModule.forFeature([SchoolYear, EnrollmentRequest, EnrollmentChild, Parent, User, Student, Teacher, SchoolYear, ClassGroup]),
  StudentsModule, ParentsModule, AuthModule, UsersModule, ClassesModule, EnrollmentModule // ✅ récupère StudentRepository via exports
],
  providers: [EnrollmentService, SchoolYearService],
  controllers: [EnrollmentController, SchoolYearController],
})
export class EnrollmentModule {}

