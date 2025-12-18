// src/billing/enums/family-billing-status.enum.ts
export enum FamilyBillingStatus {
  PENDING = 'PENDING',   // facture créée, pas encore de paiement
  PARTIAL = 'PARTIAL',   // payée partiellement
  PAID = 'PAID',         // payée complètement
  OVERDUE = 'OVERDUE',   // en retard
}
