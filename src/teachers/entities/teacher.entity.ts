import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { ClassGroup } from '../../classes/entities/class-group.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  // Matières enseignées
  @ManyToMany(() => Subject, (subject) => subject.teachers, { eager: true })
  @JoinTable()
  subjects: Subject[];

  // Classes / groupes pris en charge
  @ManyToMany(() => ClassGroup, (group) => group.teachers, { eager: true })
  @JoinTable()
  classGroups: ClassGroup[];
}
