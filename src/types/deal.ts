export type DealStage = 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
export type DealSource = 'REFERRAL' | 'INSTAGRAM' | 'WEBSITE' | 'WHATSAPP' | 'OTHER';

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: DealStage;
  source: DealSource | null;
  expectedCloseDate: string | null;
  lostReason: string | null;
  customer: { id: number; name: string; company: string | null };
  stageChangedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealInput {
  title: string;
  customerId: number;
  value: number;
  stage: DealStage;
  source: DealSource | null;
  expectedCloseDate: string | null;
  lostReason: string | null;
}

export interface SummaryReport {
  openCount: number;
  openValue: number;
  wonThisMonthCount: number;
  wonThisMonthValue: number;
  wonLastMonthValue: number;
  conversionRate: number | null;
  stalledCount: number;
  stalledDays: number;
}

/** Ordem das colunas do Kanban. */
export const stageOrder: DealStage[] = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export const stageLabels: Record<DealStage, string> = {
  PROSPECT: 'Prospecto',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  WON: 'Ganho',
  LOST: 'Perdido',
};

export const sourceLabels: Record<DealSource, string> = {
  REFERRAL: 'Indicação',
  INSTAGRAM: 'Instagram',
  WEBSITE: 'Site',
  WHATSAPP: 'WhatsApp',
  OTHER: 'Outro',
};

export const isOpenStage = (stage: DealStage) => stage !== 'WON' && stage !== 'LOST';
