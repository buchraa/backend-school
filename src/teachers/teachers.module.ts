import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { ClassGroup } from '../classes/entities/class-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Subject, ClassGroup])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
  
})
export class TeachersModule {}
