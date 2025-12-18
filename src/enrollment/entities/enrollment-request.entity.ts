import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { SchoolYear } from '../../schoolYear/entities/school-year.entity';
import { EnrollmentChild } from './enrollment-child.entity';

export enum EnrollmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_TEST = 'PENDING_TEST',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

@Entity()
export class EnrollmentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parent, { eager: true })
  parent: Parent;

  @ManyToOne(() => SchoolYear, { eager: true })
  schoolYear: SchoolYear;

  @OneToMany(() => EnrollmentChild, c => c.enrollmentRequest, { cascade: true })
  children: EnrollmentChild[];

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.DRAFT })
  status: EnrollmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

