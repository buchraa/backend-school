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
import { EnrollmentChild } from 'src/enrollment/entities/enrollment-child.entity';
import { EnrollmentRequest } from 'src/enrollment/entities/enrollment-request.entity';
import { Parent } from 'src/parents/entities/parent.entity';
import { AssignToGroupDto } from './dto/assign-to-group.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassGroup)
    private readonly classesRepo: Repository<ClassGroup>,
    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
        @InjectRepository(EnrollmentChild)
        private childRepo: Repository<EnrollmentChild>,
            @InjectRepository(EnrollmentRequest)
            private enrollmentRepo: Repository<EnrollmentRequest>,
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
      where: { id: In(dto.childIds) },
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


private buildFullName(child: EnrollmentChild): string {
    // existing student -> fullName déjà ok
    if (child.existingStudent?.fullName) return child.existingStudent.fullName;

    const fn = (child.tempFirstName || '').trim();
    const ln = (child.tempLastName || '').trim();
    const full = `${fn} ${ln}`.trim();
    return full || 'Élève';
  }

  // -------------------------
  // AFFECTER plusieurs EnrollmentChild à un groupe
  // -------------------------
 /* async assignChildrenToGroup(classId: number, childIds: number[]) {
    const group = await this.classesRepo.findOne({
      where: { id: classId },
      relations: ['students'],
    });
    if (!group) throw new NotFoundException('ClassGroup introuvable');

    // charge les childs + parent + existingStudent
    const children = await this.childRepo.find({
      where: { id: In(childIds) },
      relations: ['existingStudent', 'enrollmentRequest', 'enrollmentRequest.parent'],
    });

    if (children.length !== childIds.length) {
      const found = new Set(children.map(c => c.id));
      const missing = childIds.filter(id => !found.has(id));
      throw new NotFoundException(`EnrollmentChild introuvables: ${missing.join(', ')}`);
    }

    // contrôle capacité
    if (group.maxStudents) {
      const alreadyInGroup = group.students?.length ?? 0;

      // combien vont réellement ajouter un student au groupe ?
      // (si student existe, c’est un transfert de groupe, ça compte aussi)
      const willAdd = children.length;

      if (alreadyInGroup + willAdd > group.maxStudents) {
        throw new BadRequestException(`Max students exceeded for class ${group.code}`);
      }
    }

    const results: Array<{ childId: number; student: Student }> = [];

    for (const child of children) {
      const parent = child.enrollmentRequest?.parent;
      if (!parent) throw new BadRequestException(`Parent introuvable pour child ${child.id}`);

      // 1) student existe déjà ?
      let student = child.existingStudent
        ? await this.studentsRepo.findOne({
            where: { id: child.existingStudent.id },
            relations: ['classGroup', 'parent'],
          })
        : null;

      // 2) sinon, on le crée
      if (!student) {


        const studentRef = await this.generateStudentRef(parent);


        student = this.studentsRepo.create({
          fullName: this.buildFullName(child),
          studentRef,
          parent,
          classGroup: group, // affectation directe
        });

        student = await this.studentsRepo.save(student);

        // lier le child au student créé
        child.existingStudent = student;
      } else {
        // student existe : on l’affecte au groupe
        student.classGroup = group;
        student = await this.studentsRepo.save(student);
      }

      // 3) persister le choix de groupe sur l’enfant (si tu veux garder la trace)
      child.targetClassGroup = group;
      await this.childRepo.save(child);

      results.push({ childId: child.id, student });
    }

    // renvoyer le groupe rechargé (avec students) + détails
    const reloaded = await this.classesRepo.findOne({
      where: { id: classId },
      relations: ['teachers', 'students'],
    });

    return {
      ok: true,
      group: reloaded,
      assigned: results,
    };
  }
*/
  

  private numToLetters(n: number): string {
  // 1 -> A, 2 -> B, ... 26 -> Z, 27 -> AA, ...
  let s = '';
  while (n > 0) {
    n--; // base 26
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

private async generateStudentRef(parent: Parent): Promise<string> {
  const base = parent.familyCode; // ex: F25-001

  // On récupère le dernier student du parent (rapide)
  const last = await this.studentsRepo.findOne({
    where: { parent: { id: parent.id } },
    select: { id: true, studentRef: true },
    order: { id: 'DESC' },
  });

  // Format attendu: F25-001-001A (num + lettres à la fin)
  // On extrait le numéro si possible
  let nextNum = 1;

  if (last?.studentRef) {
    const m = last.studentRef.match(/-(\d+)([A-Z]+)$/); // ex: "-001A" ou "-027AA"
    if (m) {
      nextNum = Number(m[1]) + 1;
    } else {
      // fallback si ancien format
      const count = await this.studentsRepo.count({ where: { parent: { id: parent.id } } });
      nextNum = count + 1;
    }
  }

  const letters = this.numToLetters(nextNum); // 1->A, 2->B, 27->AA...
  const padded = String(nextNum).padStart(3, '0'); // 001, 002...

  return `${base}-${padded}${letters}`; // F25-001-001A
}



  
  
  async removeStudentFromGroup(groupId: number, studentId: number) {
    // 1) vérifier le groupe
    const group = await this.classesRepo.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('ClassGroup introuvable');
    }

    // 2) charger l’étudiant
    const student = await this.studentsRepo.findOne({
      where: { id: studentId },
      relations: ['classGroup', 'parent'],
    });
    if (!student) {
      throw new NotFoundException(`Student #${studentId} introuvable`);
    }

    // 3) vérifier qu’il appartient bien à ce groupe
    if (!student.classGroup || student.classGroup.id !== groupId) {
      throw new BadRequestException(
        'Cet élève n’est pas affecté à ce groupe',
      );
    }

    // 4) retirer l’affectation
    student.classGroup = null;
    await this.studentsRepo.save(student);

    // 5) optionnel mais très conseillé :
    // nettoyer le lien côté EnrollmentChild
    const child = await this.childRepo.findOne({
      where: {
        existingStudent: { id: student.id },
      },
      relations: ['targetClassGroup'],
    });

    if (child) {
      child.targetClassGroup = undefined;
      await this.childRepo.save(child);
    }

    return {
      ok: true,
      studentId,
      groupId,
    };
  }

  // dto



async assignChildrenToGroup(classId: number, dto: AssignToGroupDto) {
  const ids = (dto.childIds || []).filter(Boolean);
  if (!ids.length) return { ok: true, added: 0, missing: [] };

  const group = await this.classesRepo.findOne({
    where: { id: classId },
    relations: ['students'],
  });
  if (!group) throw new NotFoundException('ClassGroup introuvable');

  // 1) Charger les EnrollmentChild correspondant aux ids
  const children = await this.childRepo.find({
    where: { id: In(ids) },
    relations: [
      'existingStudent',
      'enrollmentRequest',
      'enrollmentRequest.parent',
    ],
  });
  const childIdsFound = new Set(children.map(c => c.id));

  // 2) Les ids restants -> tenter Students
  const remaining = ids.filter(id => !childIdsFound.has(id));
  const students = remaining.length
    ? await this.studentsRepo.find({
        where: { id: In(remaining) },
        relations: ['parent', 'classGroup'],
      })
    : [];

  const studentIdsFound = new Set(students.map(s => s.id));

  // 3) IDs introuvables
  const missing = ids.filter(id => !childIdsFound.has(id) && !studentIdsFound.has(id));
  // (tu peux choisir de throw si missing non vide)
  // if (missing.length) throw new NotFoundException(`Ids introuvables: ${missing.join(', ')}`);

  // 4) Capacité: combien on va réellement ajouter ?
  const already = group.students?.length ?? 0;

  // On va produire des Students finaux (issus de children + students directs)
  const toAssign: any[] = [];

  // A) Children -> Student
  for (const child of children) {
    let student = child.existingStudent;

    // Si pas encore student => le créer
    if (!student) {
      const parent = child.enrollmentRequest?.parent;
      if (!parent) {
        // si tu veux quand même gérer un child sans parent (rare), tu peux skip ou throw
        continue;
      }

      const studentRef = await this.generateStudentRef(parent);

      student = this.studentsRepo.create({
          fullName: this.buildFullName(child),
          studentRef,
          parent,
          classGroup: group, // affectation directe
      });

      student = await this.studentsRepo.save(student);

      // Lier enrollment child -> existingStudent
      child.existingStudent = student;
      await this.childRepo.save(child);
    }

    toAssign.push(student);
  }

  // B) Students directs
  toAssign.push(...students);

  // Dédoublonner (au cas où)
  const uniq = new Map<number, any>();
  for (const s of toAssign) uniq.set(s.id, s);
  const finalStudents = [...uniq.values()];

  // 5) Capacité
  if (group.maxStudents && already + finalStudents.length > group.maxStudents) {
    throw new BadRequestException(`Max students exceeded for class ${group.code}`);
  }

  // 6) Affectation
  for (const s of finalStudents) {
    s.classGroup = group;
  }
  await this.studentsRepo.save(finalStudents);

  return {
    ok: true,
    added: finalStudents.length,
    missing,
    assignedStudentIds: finalStudents.map(s => s.id),
  };
}

}


