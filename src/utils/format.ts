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

const timeOnly = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const weekdayDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const fullDateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** "Hoje, 17:00", "Amanhã, 10:00", "Ontem, 15:00" ou "qui., 16/10, 10:00". */
export function formatDue(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - today.getTime()) / DAY_MS);
  const time = timeOnly.format(date);
  if (diff === 0) return `Hoje, ${time}`;
  if (diff === 1) return `Amanhã, ${time}`;
  if (diff === -1) return `Ontem, ${time}`;
  return `${weekdayDate.format(date)}, ${time}`;
}

/** Versão curta para espaços pequenos: "Hoje", "Amanhã", "Ontem" ou "16/10". */
export function formatDueShort(iso: string) {
  const full = formatDue(iso);
  if (full.startsWith('Hoje') || full.startsWith('Amanhã') || full.startsWith('Ontem')) return full.split(',')[0];
  return shortDate.format(new Date(iso));
}

/** 11/10/2026 14:30 */
export const formatDateTime = (iso: string) => fullDateTime.format(new Date(iso));

/** Valores para inputs date/time a partir de um instante ISO (no horário local). */
export function toDateTimeInputs(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

/** Junta os inputs date ("2026-10-16") e time ("14:00") num instante ISO, no horário local. */
export function fromDateTimeInputs(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export const plural =(count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;
