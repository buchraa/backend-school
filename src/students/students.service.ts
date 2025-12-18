import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Parent } from '../parents/entities/parent.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentsRepo: Repository<Parent>,
  ) {}

  findAll(): Promise<Student[]> {
    return this.studentsRepo.find({
      relations: ['parent'],
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepo.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return student;
  }

  private generateRef(familyCode: string, index: number): string {
    // index = 0 → A, 1 → B, 2 → C, ...
    const baseCharCode = 'A'.charCodeAt(0);
    const letter = String.fromCharCode(baseCharCode + index);
    return `${familyCode}${letter}`;
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const parent = await this.parentsRepo.findOne({
      where: { id: dto.parentId },
      relations: ['children'],
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent #${dto.parentId} not found for this student`,
      );
    }

    // Nombre d’enfants déjà enregistrés pour cette famille
    const existingChildrenCount = parent.children ? parent.children.length : 0;

    // Génération de la ref : familyCode + lettre
    const studentRef = this.generateRef(parent.familyCode, existingChildrenCount);

    const student = this.studentsRepo.create({
      fullName: dto.fullName,
      studentRef,
      parent,
    });

    return this.studentsRepo.save(student);
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (dto.fullName !== undefined) student.fullName = dto.fullName;
    // On ne touche pas à studentRef dans update pour l’instant

    return this.studentsRepo.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepo.remove(student);
  }

  // admin-students.service.ts
async searchStudents(search: string) {
  const q = `%${search.toLowerCase()}%`;

  const students = await this.studentsRepo
    .createQueryBuilder('s')
    .leftJoinAndSelect('s.parent', 'p')
    .where('LOWER(s.firstName) LIKE :q', { q })
    .orWhere('LOWER(s.lastName) LIKE :q', { q })
    .orWhere('LOWER(s.fullName) LIKE :q', { q })
    .orWhere('LOWER(s.studentRef) LIKE :q', { q })
    .orderBy('s.lastName', 'ASC')
    .limit(20)
    .getMany();

  return students.map((s) => ({
    id: s.id,
    studentRef: s.studentRef,
    fullName: s.fullName,
    level: (s as any).level,
    parentName: s.parent?.fullName,
  }));
}

}
