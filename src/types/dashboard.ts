import type { DealSource, DealStage } from './deal';

export interface Dashboard {
  windowDays: number;
  revenueByMonth: { month: string; count: number; value: number }[];
  funnel: { stage: DealStage; reached: number; rate: number }[];
  sources: { source: DealSource; deals: number; won: number; wonValue: number }[];
  forecast: {
    weightedValue: number;
    openValue: number;
    byStage: { stage: DealStage; probability: number; deals: number; value: number; weighted: number }[];
  };
  averageCycleDays: number | null;
  averageTicket: number | null;
  lostReasons: { reason: string; count: number }[];
  stalled: { id: number; title: string; customer: string; stage: DealStage; value: number; days: number }[];
}
