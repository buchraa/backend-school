import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// On importera les entités une fois créées
import { Parent } from './parents/entities/parent.entity';
import { Student } from './students/entities/student.entity'
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { FamilyBillingModule } from './family-billing/family-billing.module';
import { BillingModule } from './billing/billing.module';
import { FamilyBilling } from './billing/entities/family-billing.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ClassesModule } from './classes/classes.module';
import { TeachersModule } from './teachers/teachers.module';
import { MeModule } from './me/me.module';
import { StaffModule } from './staff/staff.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    providers: [
    // Optionnel : tu peux mettre RolesGuard en global ici
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
  imports: [
    // Permet d'utiliser process.env partout
    SubjectsModule,

    EnrollmentModule,
    StaffModule,
    ClassesModule,
    MeModule,
    ClassesModule,
    TeachersModule,
    ParentsModule,
    StudentsModule,
    BillingModule,
    PaymentsModule,
    UsersModule,
    AuthModule,
    AdminModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule,
    // Connexion PostgreSQL + TypeORM
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME,
       autoLoadEntities: true, 
        synchronize: true, // OK en DEV, à mettre à false en prod
        logging: true,
      }),
    }),

    FamilyBillingModule,

    BillingModule,

    UsersModule,

    AdminModule,

    SubjectsModule,

    ClassesModule,

    TeachersModule,

    StaffModule,
    ParentsModule

    // Tu ajouteras tes modules métier ici (ParentsModule, StudentsModule, etc.)
  ],
})
export class AppModule {}
