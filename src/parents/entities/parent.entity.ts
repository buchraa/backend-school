import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from '../../students/entities/student.entity'

@Entity()
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  // Code famille issu de ton Excel (ex: "1")
@Column({ unique: true, length: 7 })
familyCode: string;

  @Column()
  fullName: string; // "Moustapha Ndoye"

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => Student, (student) => student.parent)
  children?: Student[];
}
