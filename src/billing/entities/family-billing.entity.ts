// src/billing/entities/family-billing.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  OneToMany,
} from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum FamilyBillingStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity()
@Unique(['parent', 'year', 'month'])
export class FamilyBilling {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parent, { eager: true })
  parent: Parent;

  @Column()
  year: number; // ex: 2025

  @Column()
  month: number; // 1–12

  @Column({ type: 'int' })
  childrenCount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  expectedAmount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date | null;
  
  @OneToMany(() => Payment, (payment) => payment.familyBilling)
  payments: Payment[];

  @Column({
    type: 'enum',
    enum: FamilyBillingStatus,
    default: FamilyBillingStatus.PENDING,
  })
  status: FamilyBillingStatus;

}
