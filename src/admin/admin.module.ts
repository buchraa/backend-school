import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from 'src/parents/entities/parent.entity';
import { Student } from 'src/students/entities/student.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { User } from 'src/users/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { ParentsModule } from 'src/parents/parents.module';
import { StudentsModule } from 'src/students/students.module';
import { UsersModule } from 'src/users/users.module';
import { ParentsService } from 'src/parents/parents.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TeachersService } from 'src/teachers/teachers.service';
import { StaffService } from 'src/staff/staff.service';
import { Subject } from 'rxjs';
import { TeachersModule } from 'src/teachers/teachers.module';
import { StaffModule } from 'src/staff/staff.module';
import { ClassGroup } from 'src/classes/entities/class-group.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import { EnrollmentRequest } from 'src/enrollment/entities/enrollment-request.entity';
import { SchoolYearService } from 'src/schoolYear/schoolYear.service';
import { SchoolYear } from 'src/schoolYear/entities/school-year.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MailService } from 'src/mail/mail.service';


@Module({
  imports: [TypeOrmModule.forFeature([Parent, User, Student, Teacher, Staff, Subject, ClassGroup, EnrollmentRequest, SchoolYear]),AuthModule, StudentsModule, ParentsModule, AuthModule, UsersModule, TeachersModule, StaffModule],
  controllers: [AdminUsersController],
  providers: [MailService, ParentsService, UsersService, AuthService, JwtService, TeachersService, StaffService, AdminDashboardService, SchoolYearService,],
  
})
export class AdminModule {}
