export type ActivityType = 'NOTE' | 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING';

export type TimelineKind = ActivityType | 'STAGE_CHANGE' | 'LEAD_RECEIVED' | 'TASK_DONE';

export interface TimelineItem {
  kind: TimelineKind;
  title: string | null;
  detail: string | null;
  at: string;
  dealId: number | null;
  dealTitle: string | null;
  author: string | null;
  /** Só atividades registradas têm id (e podem ser excluídas). */
  activityId: number | null;
}

export interface ActivityInput {
  type: ActivityType;
  content: string;
  dealId: number | null;
}

export const activityLabels: Record<ActivityType, string> = {
  NOTE: 'Anotação',
  CALL: 'Ligação',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  MEETING: 'Reunião',
};
