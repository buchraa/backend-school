import {
    ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Subject } from '../subjects/entities/subject.entity';
import { ClassGroup } from '../classes/entities/class-group.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    @InjectRepository(Subject)
    private readonly subjectsRepo: Repository<Subject>,
    @InjectRepository(ClassGroup)
    private readonly classGroupsRepo: Repository<ClassGroup>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return this.teachersRepo.find();
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teachersRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`Teacher #${id} not found`);
    }
    return teacher;
  }

private async loadSubjects(ids?: number[]): Promise<Subject[]> {
  if (!ids || ids.length === 0) return [];
  return this.subjectsRepo.find({ where: { id: In(ids) } });
}

private async loadClassGroups(ids?: number[]): Promise<ClassGroup[]> {
  if (!ids || ids.length === 0) return [];
  return this.classGroupsRepo.find({ where: { id: In(ids) } });
}


  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const subjects = await this.loadSubjects(dto.subjectIds);
    const groups = await this.loadClassGroups(dto.classGroupIds);

    const teacher = this.teachersRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      subjects,
      classGroups: groups,
    });

    return this.teachersRepo.save(teacher);
  }

// src/teachers/teachers.service.ts
async update(id: number, dto: UpdateTeacherDto): Promise<Teacher> {
  const teacher = await this.findOne(id);

  if (dto.fullName !== undefined) teacher.fullName = dto.fullName;
  if (dto.email !== undefined) teacher.email = dto.email;
  if (dto.phone !== undefined) teacher.phone = dto.phone;

  if (dto.subjectIds !== undefined) {
    const subjects = await this.loadSubjects(dto.subjectIds);
    teacher.subjects = subjects;
  }

  if (dto.classGroupIds !== undefined) {
    const groups = await this.loadClassGroups(dto.classGroupIds);
    teacher.classGroups = groups;
  }

  return this.teachersRepo.save(teacher);
}


  async remove(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    await this.teachersRepo.remove(teacher);
  }

  async findByIdWithRelations(id: number): Promise<Teacher> {
  const teacher = await this.teachersRepo.findOne({
    where: { id },
    relations: ['subjects', 'classGroups', 'classGroups.students'],
  });

  if (!teacher) {
    throw new NotFoundException(`Teacher #${id} not found`);
  }

  return teacher;
}

async getMyTeacherDashboard(teacherId: number) {
  if (!teacherId) throw new ForbiddenException('No teacher profile');

  const classes = await this.classGroupsRepo.find({
    where: { teachers: { id: teacherId } } as any,
    relations: ['students', 'teachers'],
    order: { code: 'ASC' } as any,
  });

  return {
    teacherId,
    classes: classes.map(c => ({
      id: c.id,
      code: c.code,
      label: c.label,
      level: c.level,
      studentsCount: c.students?.length ?? 0,
    })),
  };
}

async getMyClassDetail(teacherId: number, classId: number) {
  const group = await this.classGroupsRepo.findOne({
    where: { id: classId },
    relations: ['teachers', 'students'],
  });
  if (!group) throw new NotFoundException('Class not found');

  const ok = group.teachers?.some(t => t.id === teacherId);
  if (!ok) throw new ForbiddenException('Not your class');

  return {
    id: group.id,
    code: group.code,
    label: group.label,
    level: group.level,
    students: (group.students ?? []).map(s => ({
      id: s.id,
      fullName: s.fullName,
      studentRef: s.studentRef,
    })),
  };
}


}
