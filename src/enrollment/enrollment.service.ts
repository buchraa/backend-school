import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Parent } from '../parents/entities/parent.entity';
import { SchoolYear } from '../schoolYear/entities/school-year.entity';
import { EnrollmentRequest, EnrollmentStatus } from './entities/enrollment-request.entity';
import { EnrollmentChild } from './entities/enrollment-child.entity';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreatePublicEnrollmentDto } from './dto/create-enrollment.dto';
import { User } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { Role } from 'src/auth/role.enum';
import { Student } from 'src/students/entities/student.entity';
import { SchoolYearService } from 'src/schoolYear/schoolYear.service';
import { ClassGroup } from 'src/classes/entities/class-group.entity';
import { In} from 'typeorm';

type ListFilters = {
  q?: string;
  status?: 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_TEST' | 'VALIDATED' | 'REJECTED' | 'DRAFT';
  assigned?: 'ALL' | '0' | '1';
  schoolYearId?: number;
};

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(SchoolYear)
    private yearRepo: Repository<SchoolYear>,

    @InjectRepository(EnrollmentRequest)
    private enrollmentRepo: Repository<EnrollmentRequest>,

    @InjectRepository(EnrollmentChild)
    private childRepo: Repository<EnrollmentChild>,

    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    private authService: AuthService,
    private readonly svc: SchoolYearService,
    @InjectRepository(ClassGroup)
        private readonly classRepo: Repository<ClassGroup>,
  ) {}

  // -------- PUBLIC ENROLLMENT (nouveau parent)
  async createPublicEnrollment(dto: CreatePublicEnrollmentDto) {
    const existing = await this.parentRepo.findOne({
      where: { email: dto.parent.email },
    });

    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec cet email.');
    }
  let familyCode = await this.generateFamilyCode();

  // Sécurité contre collision improbable
  while (await this.parentRepo.findOne({ where: { familyCode } })) {
    familyCode = await this.generateFamilyCode();
  }



    const parent = this.parentRepo.create({
      fullName: dto.parent.fullName,
      email: dto.parent.email,
      phone: dto.parent.phone,
        familyCode,
    });

    const savedParent = await this.parentRepo.save(parent);

    // Create user account
    const passHash = await this.authService.hashPassword(dto.parent.password);

    const user = this.userRepo.create({
      email: dto.parent.email,
      passwordHash: passHash,
      role: Role.PARENT,
      parent: savedParent,
    });

    await this.userRepo.save(user);

const year = await this.svc.getActiveYear();
if (!year) {
  throw new BadRequestException('Aucune année scolaire active');
}

    const enrollment = this.enrollmentRepo.create({
      parent: savedParent,
      schoolYear: year,
      status: EnrollmentStatus.SUBMITTED,
      children: dto.children.map((c) =>
        this.childRepo.create({
          tempFirstName: c.firstName,
          tempLastName: c.lastName,
          birthDate: c.birthDate,
          desiredLevel: c.desiredLevel,
          notes: c.notes,
        }),
      ),
    });

    return this.enrollmentRepo.save(enrollment);
  }

  // -------- PARENT : CHARGER DEMANDE
  async getCurrentEnrollment(parentId: number) {
const year = await this.svc.getActiveYear();
if (!year) {
  throw new BadRequestException('Aucune année scolaire active');
}

    return this.enrollmentRepo.findOne({
      where: {
        parent: { id: parentId },
        schoolYear: { id: year.id },
      },
      relations: ['children', 'children.existingStudent'],
    });
  }

// -------- PARENT : CRÉER brouillon si inexistant
async startEnrollmentForParent(parentId: number) {
  const year = await this.svc.getActiveYear();
  if (!year) throw new BadRequestException('Aucune année scolaire active');

  // 1) s'il existe déjà un dossier pour cette année, on le renvoie
  const existing = await this.enrollmentRepo.findOne({
    where: {
      parent: { id: parentId },
      schoolYear: { id: year.id },
    },
    relations: ['children', 'children.existingStudent'],
  });

  if (existing) return existing;

  // 2) sinon on crée un brouillon
  const parent = await this.parentRepo.findOne({
    where: { id: parentId },
    relations: ['children'],
  });
  if (!parent) throw new NotFoundException('Parent not found');

  const enr = this.enrollmentRepo.create({
    parent,
    schoolYear: year,
    status: EnrollmentStatus.DRAFT,
    children: (parent.children ?? []).map((s) =>
      this.childRepo.create({
        existingStudent: s,
        desiredLevel: '',
      }),
    ),
  });

  return this.enrollmentRepo.save(enr);
}

  // -------- PARENT : UPDATE
  async updateEnrollment(parentId: number, dto: UpdateEnrollmentDto) {
    const enr = await this.getCurrentEnrollment(parentId);
    if (!enr) throw new NotFoundException('No enrollment found.');

    // Update existing children
    for (const childDto of dto.existingChildren || []) {
      const child = enr.children.find((c) => c.id === childDto.enrollmentChildId);
      if (child) {
        child.desiredLevel = childDto.desiredLevel ?? child.desiredLevel;
        child.notes = childDto.notes ?? child.notes;
      }
    }

    // Add new children
    for (const nc of dto.newChildren || []) {
      enr.children.push(
        this.childRepo.create({
          tempFirstName: nc.firstName,
          tempLastName: nc.lastName,
          birthDate: nc.birthDate,
          desiredLevel: nc.desiredLevel,
          notes: nc.notes,
        }),
      );
    }

    if (dto.submit) {
      enr.status = EnrollmentStatus.SUBMITTED;
    }

    return this.enrollmentRepo.save(enr);
  }

  // utilitaire exemple pour générer un studentRef (tu peux réutiliser ta logique existante)
  private async generateStudentRef(parent: Parent): Promise<string> {
    // ex : F25-001A, F25-001B… selon tes règles
    // ici on fait simple : familyCode + lettre
    const base = parent.familyCode; // ex: F25-001
    const existing = await this.studentRepo.find({
      where: { parent: { id: parent.id } },
      order: { id: 'ASC' },
    });
    const index = existing.length; // 0,1,2...
    const letter = String.fromCharCode('A'.charCodeAt(0) + index);
    return `${base}${letter}`;
  }

async updateStatus(enrollmentId: number, newStatus: EnrollmentStatus) {
  const enr = await this.enrollmentRepo.findOne({
    where: { id: enrollmentId },
    relations: [
      'parent',
      'children',
      'children.existingStudent',
      'children.targetClassGroup',
    ],
  });

  if (!enr) {
    throw new NotFoundException('Enrollment not found');
  }

  const previousStatus = enr.status;
  enr.status = newStatus;

  // Si on ne passe pas en VALIDATED → on ne fait que sauver le statut
  if (
    newStatus !== EnrollmentStatus.VALIDATED ||
    previousStatus === EnrollmentStatus.VALIDATED
  ) {
    return this.enrollmentRepo.save(enr);
  }

  // 🔥 Ici : on passe de SUBMITTED / UNDER_REVIEW / PENDING_TEST → VALIDATED
  // On crée / met à jour les Students + affectation classe
  for (const child of enr.children) {
    let student: any; // ✅ UN seul Student

    if (child.existingStudent) {
      // ----- CAS RÉINSCRIPTION -----
      student = child.existingStudent;
      if (child.desiredLevel) {
        (student as any).level = child.desiredLevel; // adapte selon ton Student
      }
    } else {
      // ----- CAS NOUVEL ENFANT -----
      const ref = await this.generateStudentRef(enr.parent);

      student = this.studentRepo.create({
        firstName: child.tempFirstName,
        lastName: child.tempLastName,
        fullName: `${child.tempFirstName} ${child.tempLastName}`,
        birthDate: child.birthDate,
        level: child.desiredLevel,
        parent: enr.parent,
        studentRef: ref,
      } as any); // "as any" si TS veut un cast

      student = await this.studentRepo.save(student);

      // on rattache le nouvel élève à l'enfant d'inscription
      child.existingStudent = student;
    }

    // Affectation à la classe si une targetClassGroup est définie
    if (child.targetClassGroup) {
      (student as any).classGroup = child.targetClassGroup;
      await this.studentRepo.save(student);
    }

    await this.childRepo.save(child);
  }

  return this.enrollmentRepo.save(enr);
}

async getRequestById(id: number) {
  return this.enrollmentRepo.findOne({
    where: { id },
    relations: [
      'parent',
      'schoolYear',
      'children',
      'children.existingStudent',
      'children.targetClassGroup',
    ],
  });
}


private async generateFamilyCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // ex: "25"

  // Compter combien de parents ont déjà un code de cette année
  const count = await this.parentRepo.count({
    where: {
      familyCode: Like(`F${yearSuffix}-%`)
    }
  });

  // Le prochain numéro, +1
  const nextNumber = count + 1;

  // Format sur 3 chiffres => "001", "023", etc.
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `F${yearSuffix}-${paddedNumber}`;
}

 async searchEnrollmentChildren(search: string) {
  const q = `%${search.toLowerCase()}%`;
    if (!q) return [];

     const students = await this.childRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.enrollmentRequest', 'req')
      .leftJoinAndSelect('req.parent', 'parent')
      .leftJoinAndSelect('c.existingStudent', 'student')
      .leftJoinAndSelect('c.targetClassGroup', 'target')
    .where('LOWER(c.tempFirstName) LIKE :q', { q })
    .orWhere('LOWER(c.tempLastName) LIKE :q', { q })
    //.orWhere('LOWER(s.fullName) LIKE :q', { term })
      .orderBy('c.id', 'DESC')
      .limit(50)
      .getMany();

        return students.map((c) => ({
    id: c.id,
    fullName: `${c.tempFirstName} ${c.tempLastName}`,
    level: c.desiredLevel,
    existingStudent: c.existingStudent,
    parentName: c.enrollmentRequest.parent?.fullName,
    familyCode: c.enrollmentRequest.parent?.familyCode,
  }));
  }

  

}
