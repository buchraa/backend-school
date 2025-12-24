import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn  } from 'typeorm';
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

  // ✅ colonne FK explicite (plus simple à update)
  @Column({ nullable: true })
  targetClassGroupId?: number;


@ManyToOne(() => ClassGroup, { nullable: true })
  @JoinColumn({ name: 'targetClassGroupId' })
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
