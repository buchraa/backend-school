import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../auth/role.enum';
import { Parent } from '../../parents/entities/parent.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: Role.PARENT,
  })
  role: Role;

  // 🔗 Lien vers la famille (Parent)
  @OneToOne(() => Parent, { nullable: true, eager: true })
  @JoinColumn()
  parent: Parent | null;

  @OneToOne(() => Teacher, { nullable: true, eager: true })
  @JoinColumn()
  teacher: Teacher | null;

  @OneToOne(() => Staff, { nullable: true, eager: true })
  @JoinColumn()
  staff: Staff | null;

    @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpiresAt: Date | null;

}
export { Role };

