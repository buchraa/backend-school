// src/classes/classes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassGroup } from './entities/class-group.entity';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { AssignTeachersDto } from './dto/assign-teachers.dto';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassGroup)
    private readonly classesRepo: Repository<ClassGroup>,
    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
  ) {}

  async create(dto: CreateClassGroupDto): Promise<ClassGroup> {
    const teachers = dto.teacherIds?.length
      ? await this.teachersRepo.find({ where: { id: In(dto.teacherIds) } })
      : [];

    const group = this.classesRepo.create({
      code: dto.code,
      label: dto.label,
      level: dto.level,
      maxStudents: dto.maxStudents ?? null,
      teachers,
    });

    return this.classesRepo.save(group);
  }

  async findAll(): Promise<ClassGroup[]> {
    return this.classesRepo.find({
      relations: ['teachers', 'students'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ClassGroup> {
    const group = await this.classesRepo.findOne({
      where: { id },
      relations: ['teachers', 'students'],
    });

    if (!group) {
      throw new NotFoundException(`ClassGroup #${id} not found`);
    }

    return group;
  }

  async update(id: number, dto: UpdateClassGroupDto): Promise<ClassGroup> {
    const group = await this.findOne(id);

    if (dto.code !== undefined) group.code = dto.code;
    if (dto.label !== undefined) group.label = dto.label;
    if (dto.level !== undefined) group.level = dto.level;
    if (dto.maxStudents !== undefined) group.maxStudents = dto.maxStudents;

    if (dto.teacherIds !== undefined) {
      const teachers = dto.teacherIds.length
        ? await this.teachersRepo.find({ where: { id: In(dto.teacherIds) } })
        : [];
      group.teachers = teachers;
    }

    return this.classesRepo.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.classesRepo.remove(group);
  }

  async assignStudents(
    classId: number,
    dto: AssignStudentsDto,
  ): Promise<ClassGroup> {
    const group = await this.findOne(classId);

    const students = await this.studentsRepo.find({
      where: { id: In(dto.studentIds) },
      relations: ['classGroup'],
    });

    if (group.maxStudents && students.length + (group.students?.length || 0) > group.maxStudents) {
      throw new BadRequestException(
        `Max students exceeded for class ${group.code}`,
      );
    }

    // Affecter chaque élève à cette classe
    for (const student of students) {
      student.classGroup = group;
      await this.studentsRepo.save(student);
    }

    // Recharger les relations
    return this.findOne(classId);
  }

  async assignTeachers(
    classId: number,
    dto: AssignTeachersDto,
  ): Promise<ClassGroup> {
    const group = await this.findOne(classId);

    const teachers = dto.teacherIds.length
      ? await this.teachersRepo.find({ where: { id: In(dto.teacherIds) } })
      : [];

    group.teachers = teachers;

    return this.classesRepo.save(group);
  }
}
