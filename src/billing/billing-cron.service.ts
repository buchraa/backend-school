// billing-cron.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { FamilyBilling, FamilyBillingStatus } from './entities/family-billing.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BillingCronService {
  constructor(private readonly billingService: BillingService,
     @InjectRepository(FamilyBilling)
    private billingRepo: Repository<FamilyBilling>,
    private readonly mailer: MailService,
  ) {}

  // Tous les 1er du mois à 02h du matin
  @Cron('0 2 1 * *')
  async generateMonthlyBills() {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth(); 
    // 👆 mois précédent (service consommé)

    console.log('⏳ Génération automatique des factures', year, month);

    await this.billingService.generateForMonth(year, month);
  }

 @Cron('0 0 8 * * *') // 08:00 tous les jours
  async run() {
    const now = new Date();

    // 1) Overdue = dueDate passée + impayé
    const overdue = await this.billingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.parent', 'parent')
      .where('b.dueDate IS NOT NULL')
      .andWhere('b.dueDate < :now', { now })
      .andWhere('b.expectedAmount > b.paidAmount') // impayé / partiel
      .getMany();

    for (const b of overdue) {
      if (!b.dueDate) continue;

      const daysLate = Math.floor((now.getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24));

      const should10 = daysLate >= 10 && !b.reminder10SentAt;
      const should15 = daysLate >= 15 && !b.reminder15SentAt;

      if (!should10 && !should15) continue;

      // ⚠️ Si pas d’email parent, on skip (ou on log)
       if (!b.parent?.email) continue;

      // TODO: envoyer email
       await this.mailer.sendPaymentReminder(b.parent.email, b.expectedAmount, b.month)

      if (should10) b.reminder10SentAt = now;
      if (should15) b.reminder15SentAt = now;

      // Optionnel: mettre status OVERDUE
      if (b.status === FamilyBillingStatus.PENDING) {
        b.status = FamilyBillingStatus.OVERDUE;
      }

      await this.billingRepo.save(b);
    }
  }


  private computeDueDate(year: number, month: number): Date {
  // facture du mois "month" -> échéance le 5 du mois suivant
  return new Date(year, month, 5); // month est 1..12 -> JS month+1 car month indexé 0
}

private computeReminderAt(year: number, month: number): Date {
  // relance unique le 10 du mois suivant
  return new Date(year, month, 10);
}
}
