import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class SchoolYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string; // "2025-2026"


  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isActive: boolean;
}
