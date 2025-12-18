import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EnrollmentRequest, EnrollmentStatus } from '../enrollment/entities/enrollment-request.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassGroup } from '../classes/entities/class-group.entity'; // adapte le chemin
// si tu n’as pas ClassGroup, remplace par l’entity que tu utilises pour “classes/groupes”

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(EnrollmentRequest)
    private readonly enrRepo: Repository<EnrollmentRequest>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(ClassGroup)
    private readonly classRepo: Repository<ClassGroup>,
  ) {}

  async getKpis() {
    const [pendingEnrollments, students, teachers, classGroups] = await Promise.all([
      this.enrRepo.count({ where: { status: EnrollmentStatus.SUBMITTED } }),
      this.studentRepo.count(),
      this.teacherRepo.count(),
      this.classRepo.count(),
    ]);

    return {
      pendingEnrollments,
      students,
      teachers,
      classGroups,
    };
  }

  async getRecentEnrollments() {
    const list = await this.enrRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['parent', 'children'], // adapte si nécessaire
    });

    return list.map((e) => ({
      id: e.id,
      familyName: e.parent?.fullName ?? '—',
      familyCode: e.parent?.familyCode ?? '—',
      childrenCount: e.children?.length ?? 0,
      status: e.status,
      createdAt: e.createdAt,
    }));
  }

    async getAllEnrollments() {
    const list = await this.enrRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['parent', 'children'], // adapte si nécessaire
    });

    return list.map((e) => ({
      id: e.id,
      familyName: e.parent?.fullName ?? '—',
      familyCode: e.parent?.familyCode ?? '—',
      childrenCount: e.children?.length ?? 0,
      status: e.status,
      createdAt: e.createdAt,
    }));
  }

  async getAlerts() {
    // MVP : alertes simples (tu pourras raffiner ensuite)
    // Ex: demandes en attente depuis > 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldPending = await this.enrRepo.count({
      where: { status: EnrollmentStatus.SUBMITTED, createdAt: (date: any) => date < sevenDaysAgo } as any,
    });

    // Ex: classes sans enseignant (si ton ClassGroup a teacher nullable)
    const classesNoTeacher = await this.classRepo.count({
      where: { teacher: null } as any,
    });

    const alerts: { type: 'WARN' | 'INFO'; message: string }[] = [];
    if (oldPending > 0) alerts.push({ type: 'WARN', message: `${oldPending} demandes en attente depuis plus de 7 jours.` });
    if (classesNoTeacher > 0) alerts.push({ type: 'INFO', message: `${classesNoTeacher} classe(s) sans enseignant affecté.` });

    return alerts;
  }
}
