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

@Module({
  imports: [
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
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
