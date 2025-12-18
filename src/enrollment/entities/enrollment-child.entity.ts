import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { EnrollmentRequest } from './enrollment-request.entity';
import { Student } from '../../students/entities/student.entity';
import { ClassGroup } from 'src/classes/entities/class-group.entity';

@Entity()
export class EnrollmentChild {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EnrollmentRequest, r => r.children)
  enrollmentRequest: EnrollmentRequest;

  @ManyToOne(() => Student, { nullable: true })
  existingStudent?: Student; // si réinscription

    // 🔹 Classe cible choisie par l’admin / staff
  @ManyToOne(() => ClassGroup, { nullable: true })
  targetClassGroup?: ClassGroup;

  // Pour les nouveaux enfants
  @Column({ nullable: true })
  tempFirstName: string;

  @Column({ nullable: true })
  tempLastName: string;

  @Column({ nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  desiredLevel: string;

  @Column({ nullable: true })
  notes: string;
}
