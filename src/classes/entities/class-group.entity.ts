// src/classes/entities/class-group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class ClassGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // ex: "CP-A", "CE1-B"

  @Column({ nullable: true })
  label: string; // ex: "CP Groupe A - Matin"

  @Column({ nullable: true })
  level: string; // ex: "CP", "CE1", "Collège", etc.

  @Column({ type: 'int', nullable: true })
  maxStudents: number | null;

  @ManyToMany(() => Teacher, (teacher) => teacher.classGroups)
  teachers: Teacher[];

  @OneToMany(() => Student, (student) => student.classGroup)
  students: Student[];
}
