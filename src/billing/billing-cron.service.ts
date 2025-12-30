import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyBilling, FamilyBillingStatus } from './entities/family-billing.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BillingCronService {
  constructor(
    private readonly billingService: BillingService,
    @InjectRepository(FamilyBilling)
    private billingRepo: Repository<FamilyBilling>,
    private readonly mailer: MailService,
  ) {}

  // Tous les 1er du mois à 02h du matin
  @Cron('0 2 1 * *')
  async generateMonthlyBills() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // mois précédent (service consommé)
    console.log('⏳ Génération automatique des factures', year, month);
    await this.billingService.generateForMonth(year, month);
  }

  // ✅ Relances uniquement 10 / 15 / 20 / 25 à 08:00
  @Cron('0 0 8 10 * *')
  async runReminder10() {
    return this.runReminderStage(10);
  }

  @Cron('0 0 8 15 * *')
  async runReminder15() {
    return this.runReminderStage(15);
  }

  @Cron('0 0 8 20 * *')
  async runReminder20() {
    return this.runReminderStage(20);
  }

  @Cron('0 0 8 25 * *')
  async runReminder25() {
    return this.runReminderStage(25);
  }

  /**
   * Relance "stageDay" (10/15/20/25) pour les factures impayées en retard
   * dueDate = 5 => seuil de retard = stageDay - 5 jours
   */
  private async runReminderStage(stageDay: 10 | 15 | 20 | 25) {
    const now = new Date();
    const thresholdDaysLate = stageDay - 5; // dueDate le 5

    // date limite : dueDate <= now - thresholdDaysLate
    const limit = new Date(now);
    limit.setDate(limit.getDate() - thresholdDaysLate);

    const qb = this.billingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.parent', 'parent')
      .where('b.dueDate IS NOT NULL')
      .andWhere('b.dueDate <= :limit', { limit })
      .andWhere('b.expectedAmount > b.paidAmount'); // impayé / partiel

    // on ne prend que celles pas encore relancées pour ce palier
    if (stageDay === 10) qb.andWhere('b.reminder10SentAt IS NULL');
    if (stageDay === 15) qb.andWhere('b.reminder15SentAt IS NULL');
    if (stageDay === 20) qb.andWhere('b.reminder20SentAt IS NULL');
    if (stageDay === 25) qb.andWhere('b.reminder25SentAt IS NULL');

    const overdue = await qb.getMany();
    if (!overdue.length) return;

    for (const b of overdue) {
      if (!b.parent?.email) continue;

      await this.mailer.sendPaymentReminder(
        b.parent.email,
        b.expectedAmount,
        b.month,
        stageDay, // si tu veux l'afficher dans le mail
      );

      if (stageDay === 10) b.reminder10SentAt = now;
      if (stageDay === 15) b.reminder15SentAt = now;
      if (stageDay === 20) b.reminder20SentAt = now;
      if (stageDay === 25) b.reminder25SentAt = now;

      if (b.status === FamilyBillingStatus.PENDING) {
        b.status = FamilyBillingStatus.OVERDUE;
      }
    }

    // ✅ save en batch
    await this.billingRepo.save(overdue);
  }

  // Si tu veux garder ces helpers, ils doivent refléter tes règles
  private computeDueDate(year: number, month: number): Date {
    // échéance le 5 du mois suivant
    return new Date(year, month, 5);
  }
}