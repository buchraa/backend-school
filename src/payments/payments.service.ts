import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Parent } from '../parents/entities/parent.entity';
import { ImportBankDto, BankPaymentLineDto } from './dto/import-bank.dto';
import { FamilyBilling } from '../billing/entities/family-billing.entity';
import { FamilyBillingStatus } from '../billing/entities/family-billing.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(Parent)
    private readonly parentsRepo: Repository<Parent>,
    @InjectRepository(FamilyBilling)
    private readonly billingRepo: Repository<FamilyBilling>,
  ) {}

  // helper : extraire le code famille depuis la référence
private extractFamilyCode(ref: string): string | null {
  // exemple simple : chercher Fxx-xxx
  const match = ref.match(/F\d{2}-\d{3}/i);
  return match ? match[0].toUpperCase() : null;
}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const parent = await this.parentsRepo.findOne({
      where: { familyCode: dto.familyCode },
    });

    if (!parent) {
      throw new NotFoundException(
        `Family with code ${dto.familyCode} not found`,
      );
    }

    // On retrouve la ligne de facturation du mois
    let billing = await this.billingRepo.findOne({
      where: {
        parent: { id: parent.id },
        year: dto.year,
        month: dto.month,
      },
      relations: ['parent'],
    });

    if (!billing) {
      throw new BadRequestException(
        `No billing record for family ${dto.familyCode} in ${dto.month}/${dto.year}. 
         You should generate billing first.`,
      );
    }

    const payment = this.paymentsRepo.create({
      parent,
      familyBilling: billing,
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      reference: dto.reference ?? null,
      method: 'BANK_TRANSFER',
    });

    const saved = await this.paymentsRepo.save(payment);

    // Met à jour la facturation familiale
    billing.paidAmount = Number(billing.paidAmount) + dto.amount;

    const expected = Number(billing.expectedAmount);
    const paid = Number(billing.paidAmount);

if (paid >= expected) {
  billing.status = FamilyBillingStatus.PAID;
} else if (paid > 0 && paid < expected) {
  billing.status = FamilyBillingStatus.PARTIAL;
} else {
  billing.status = FamilyBillingStatus.PENDING;
}

    billing.lastCheckedAt = new Date();
    await this.billingRepo.save(billing);

    return saved;
  }

  findAll(): Promise<Payment[]> {
    return this.paymentsRepo.find({
      order: { paymentDate: 'DESC' },
    });
  }

  async findByFamilyCode(parentId: number): Promise<Payment[]> {
  return this.paymentsRepo.find({
    where: { id: parentId  },
    select: ['parent', 'familyBilling'],
    order: { paymentDate: 'DESC' },
  });
}

async importBankLines(dto: ImportBankDto) {
  const results: Array<{ line: BankPaymentLineDto; status: string; reason?: string; familyCode?: string; billingId?: number }> = [];

  for (const line of dto.lines) {
    const familyCode = this.extractFamilyCode(line.reference);
    if (!familyCode) {
      results.push({
        line,
        status: 'SKIPPED',
        reason: 'No familyCode found in reference',
      });
      continue;
    }

    const parent = await this.parentsRepo.findOne({
      where: { familyCode },
    });

    if (!parent) {
      results.push({
        line,
        status: 'SKIPPED',
        reason: `Family ${familyCode} not found`,
      });
      continue;
    }

const paymentDate = this.parseFrenchDateStrict(line.date);

if (!paymentDate) {
  results.push({
    line,
    status: 'SKIPPED',
    reason: 'Invalid date format',
  });
  continue;
}   

const year = paymentDate.getUTCFullYear();
const month = paymentDate.getUTCMonth() + 1;

    // On suppose que le virement correspond au mois du virement
    let billing = await this.billingRepo.findOne({
      where: { parent: { id: parent.id }, year, month },
      relations: ['parent'],
    });

    if (!billing) {
      results.push({
        line,
        status: 'SKIPPED',
        reason: `No billing for ${familyCode} in ${month}/${year}`,
      });
      continue;
    }

    // Créer le Payment
    const payment = this.paymentsRepo.create({
      parent,
      familyBilling: billing,
      amount: line.amount,
      paymentDate,
      method: 'BANK_TRANSFER',
      reference: line.reference,
    });

    await this.paymentsRepo.save(payment);

    // Mettre à jour la facturation
    billing.paidAmount = Number(billing.paidAmount) + line.amount;
    const expected = Number(billing.expectedAmount);
    const paid = Number(billing.paidAmount);

   if (paid >= expected) {
  billing.status = FamilyBillingStatus.PAID;
} else if (paid > 0) {
  billing.status = FamilyBillingStatus.PARTIAL;
} else {
  billing.status = FamilyBillingStatus.PENDING;
}

    billing.lastCheckedAt = new Date();
    await this.billingRepo.save(billing);

    results.push({
      line,
      status: 'IMPORTED',
      familyCode,
      billingId: billing.id,
    });
  }

  return results;
}


private parseFrenchDateStrict(value: string): Date {
  const raw = (value ?? '').trim();

  // DD/MM/YYYY (FR)
  const fr = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) {
    const day = Number(fr[1]);
    const month = Number(fr[2]);
    const year = Number(fr[3]);

    // Debug utile (tu peux le laisser 2 minutes)
    // console.log('[DATE FR]', raw, { day, month, year });

    // Validation simple
    if (month < 1 || month > 12) throw new Error(`Invalid month in date: ${raw}`);
    if (day < 1 || day > 31) throw new Error(`Invalid day in date: ${raw}`);

    // UTC pour éviter les décalages de timezone (important)
    return new Date(Date.UTC(year, month - 1, day));
  }

  // ISO YYYY-MM-DD
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  throw new Error(`Unsupported date format: ${raw}`);
}



}
