// utils/normalize.ts
export function normalizeFamilyCode(v: string) {
  return (v ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizePhone(v: string) {
  // garde uniquement les chiffres
  return (v ?? '').replace(/\D/g, '');
}

export function last4(v: string) {
  const n = normalizePhone(v);
  return n.length >= 4 ? n.slice(-4) : n;
}
