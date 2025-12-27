// src/billing/billing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyBilling } from './entities/family-billing.entity';
import { Parent } from '../parents/entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { NotFoundException } from '@nestjs/common';
import { FamilyBillingStatus } from './entities/family-billing.entity';


@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(FamilyBilling)
    private readonly billingRepo: Repository<FamilyBilling>,
    @InjectRepository(Parent)
    private readonly parentsRepo: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
  ) {}

  private computeMonthlyFee(childrenCount: number): number {
    if (childrenCount <= 0) return 0;
    if (childrenCount === 1) return 30;
    if (childrenCount === 2 || childrenCount === 3) return 50;
    return 50 + (childrenCount - 3) * 10;
  }

  /**
   * Génère ou met à jour les lignes de facturation
   * pour toutes les familles, pour un mois donné.
   */
// ou ton chemin réel

async generateForMonth(year: number, month: number): Promise<void> {
  const parents = await this.parentsRepo.find({
    relations: ['children'],
  });

  for (const parent of parents) {
    const childrenCount = parent.children ? parent.children.length : 0;
    const expectedAmount = this.computeMonthlyFee(childrenCount);

    const dueDate = new Date(year, month, 5);

    let billing = await this.billingRepo.findOne({
      where: { parent: { id: parent.id }, year, month },
      relations: ['parent'],
    });

    if (!billing) {
      billing = this.billingRepo.create({
        parent,
        year,
        month,
        childrenCount,
        expectedAmount,
        paidAmount: 0,
        status: FamilyBillingStatus.PENDING,   // 👈 ici
        dueDate,
        lastCheckedAt: null,
      });
    } else {
      billing.childrenCount = childrenCount;
      billing.expectedAmount = expectedAmount;
      billing.dueDate = dueDate;
    }

    await this.billingRepo.save(billing);
  }
}




async getStatusForMonth(year: number, month: number) {
  return this.billingRepo.find({
    where: { year, month },
    order: { status: 'ASC' },
    relations: ['parent'],
  });
}

async getFamilyBilling(parentId: number, year: number, month: number) {
  const billing = await this.billingRepo.findOne({
    where: {
      parent: { id: parentId },
      year,
      month,
    },
    relations: ['parent'],
  });

  if (!billing) {
    throw new NotFoundException(
      `No billing record found for family ${parentId} in ${month}/${year}`,
    );
  }

  return billing;
}

async getOverdueForMonth(year: number, month: number) {
  const today = new Date();

  const billings = await this.billingRepo.find({
    where: { year, month },
    relations: ['parent'],
    order: { status: 'ASC' },
  });

  const overdue = billings.filter((b) => {
    const expected = Number(b.expectedAmount);
    const paid = Number(b.paidAmount || 0);

    const isFullyPaid = paid >= expected;
    const isDuePassed =
      b.dueDate !== null && new Date(b.dueDate).getTime() < today.getTime();

    return !isFullyPaid && isDuePassed;
  });

  for (const b of overdue) {
    if (b.status !== FamilyBillingStatus.OVERDUE) {
      b.status = FamilyBillingStatus.OVERDUE;  // 👈 ici
      b.lastCheckedAt = new Date();
      await this.billingRepo.save(b);
    }
  }

  return overdue;
}

async getFamilyHistoryForParent(parentId: number) {
  const billings = await this.billingRepo.find({
    where: { parent: { id: parentId } },
    relations: ['parent', 'payments'],
    order: { year: 'DESC', month: 'DESC' },
  });

  // Option : trier les paiements du plus récent au plus ancien
  for (const b of billings) {
    if (b.payments) {
      b.payments.sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      );
    }
  }

  return billings;
}
  
}
