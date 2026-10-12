export interface Task {
  id: number;
  title: string;
  dueAt: string;
  doneAt: string | null;
  customer: { id: number; name: string; company: string | null } | null;
  deal: { id: number; title: string } | null;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  dueAt: string;
  customerId: number | null;
  dealId: number | null;
}

export interface TaskFilters {
  done?: boolean;
  customerId?: number;
  dealId?: number;
}

export type TaskBucket = 'overdue' | 'today' | 'upcoming';

/** Em que grupo a tarefa pendente cai, pelo horário local de quem está usando. */
export function taskBucket(task: Task, now = new Date()): TaskBucket {
  const due = new Date(task.dueAt);
  if (due.getTime() < now.getTime()) return 'overdue';
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return due.getTime() <= endOfToday.getTime() ? 'today' : 'upcoming';
}
