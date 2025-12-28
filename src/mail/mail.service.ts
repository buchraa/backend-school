import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async send(to: string, subject: string, html: string) {
    return this.mailer.sendMail({ to, subject, html });
  }

    async sendPaymentReminder(email: string, amount: number, month: string) {
    return this.send(
      email,
      `Rappel de paiement – ${month}`,
      `
        <p>Bonjour,</p>
        <p>Un paiement de <strong>${amount} €</strong> est en attente pour le mois de <strong>${month}</strong>.</p>
        <p>Merci de régulariser dès que possible.</p>
        <p><strong>Daaray Paris</strong></p>
      `
    );
  }


  async sendForgotPasswordEmail(params: {
    to: string;
    fullName?: string;
    resetUrl: string;
  }) {
    const name = params.fullName?.trim() || 'Bonjour';
    console.log('RESET LINK:', params.resetUrl);
    return this.send(
      params.to,
      'Réinitialisation de votre mot de passe – Daaray Paris',
      `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <p>${name},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>
          <a href="${params.resetUrl}"
             style="display:inline-block;padding:10px 14px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none">
             Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color:#666;font-size:12px">
          Si le bouton ne fonctionne pas, copiez/collez ce lien dans votre navigateur :<br/>
          ${params.resetUrl}
        </p>
        <p>— Daaray Paris</p>
      </div>
      `
    );

    
  }
  
}
