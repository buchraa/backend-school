import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { FamilyBilling } from '../../billing/entities/family-billing.entity';

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHECK';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parent, { eager: true })
  parent: Parent;


  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'BANK_TRANSFER' })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string | null; // libellé virement bancaire

  @CreateDateColumn()
  createdAt: Date;
  
@ManyToOne(() => FamilyBilling, (billing) => billing.payments, {
  eager: false, // on va charger via relations
  nullable: true,
})
familyBilling: FamilyBilling | null;

}
