// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ParentsModule } from '../parents/parents.module';
import { AuthController } from './auth.controller';
import { TeachersModule } from '../teachers/teachers.module';
import { StaffModule } from 'src/staff/staff.module';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from 'src/parents/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Parent]),
    UsersModule,
    ParentsModule,
    TeachersModule,
    StaffModule,
    JwtModule.register({
      secret: 'SUPER_SECRET_TEST', // process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 3600, /*process.env.JWT_EXPIRES_IN
          ? Number(process.env.JWT_EXPIRES_IN)
          : 3600,*/
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
