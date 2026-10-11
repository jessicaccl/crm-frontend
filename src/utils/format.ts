const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

const DAY_MS = 86_400_000;

/** R$ 38.000 */
export const formatCurrency = (value: number) => currency.format(value);

/** R$ 61,2 mil */
export const formatCompactCurrency = (value: number) => compactCurrency.format(value);

/** 06/10 a partir de um instante ISO. */
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));

/** Converte uma data sem hora (2026-10-30) para meia-noite local, sem deslocar o dia. */
export function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Dias inteiros desde um instante ISO. */
export function daysSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS));
}

/** Dias de hoje até uma data sem hora (negativo se já passou). */
export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseLocalDate(date).getTime() - today.getTime()) / DAY_MS);
}

export const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;
