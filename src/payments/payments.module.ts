import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Parent } from '../parents/entities/parent.entity';
import { FamilyBilling } from '../billing/entities/family-billing.entity';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { SchoolYear } from 'src/schoolYear/entities/school-year.entity';
import { EnrollmentRequest } from 'src/enrollment/entities/enrollment-request.entity';
import { EnrollmentChild } from 'src/enrollment/entities/enrollment-child.entity';
import { User } from 'src/users/entities/user.entity';
import { Student } from 'src/students/entities/student.entity';
import { AuthService } from 'src/auth/auth.service';
import { SchoolYearService } from 'src/schoolYear/schoolYear.service';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { TeachersService } from 'src/teachers/teachers.service';
import { ParentsService } from 'src/parents/parents.service';
import { StaffService } from 'src/staff/staff.service';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Subject } from 'rxjs';
import { ClassGroup } from 'src/classes/entities/class-group.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentRequest, EnrollmentChild, User,Payment, Parent, FamilyBilling, SchoolYear, Student, User, Parent, Teacher, Staff, Subject, ClassGroup])],
  controllers: [PaymentsController],
  providers: [MailService, PaymentsService, EnrollmentService, AuthService, SchoolYearService, UsersService, JwtService, TeachersService, ParentsService, StaffService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
