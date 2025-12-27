import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { ClassGroup } from '../../classes/entities/class-group.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string; // "Coumba Ndoye"

  // Référence interne type "1A", "1B"
  @Column({ nullable: true })
  studentRef: string;

  @ManyToOne(() => Parent, (parent) => parent.children, { eager: true })
  parent: Parent;


@ManyToOne(() => ClassGroup, (group) => group.students, { nullable: true })
classGroup: ClassGroup | null;

}
