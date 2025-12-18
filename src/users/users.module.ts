import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Parent } from 'src/parents/entities/parent.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Parent, Teacher, Staff])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

