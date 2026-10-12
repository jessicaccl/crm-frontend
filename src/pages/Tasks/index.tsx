import { useState } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { TaskFormModal } from '../../components/TaskFormModal';
import { TaskItem } from '../../components/TaskItem';
import { useTasks } from '../../hooks/useTasks';
import { getErrorMessage } from '../../services/api';
import { taskBucket, type Task, type TaskBucket } from '../../types/task';
import '../Customers/styles.css';
import '../../components/TaskItem/styles.css';
import './styles.css';

const sections: { bucket: TaskBucket; title: string; empty: string }[] = [
  { bucket: 'overdue', title: 'Atrasadas', empty: 'Nada atrasado. 👏' },
  { bucket: 'today', title: 'Hoje', empty: 'Nada para hoje.' },
  { bucket: 'upcoming', title: 'Próximas', empty: 'Nenhuma tarefa agendada.' },
];

export const Tasks = () => {
  const pending = useTasks({ done: false });
  const [showDone, setShowDone] = useState(false);
  const done = useTasks({ done: true });
  const [target, setTarget] = useState<{ task?: Task } | null>(null);

  const grouped = (pending.data ?? []).reduce<Record<TaskBucket, Task[]>>(
    (groups, task) => {
      groups[taskBucket(task)].push(task);
      return groups;
    },
    { overdue: [], today: [], upcoming: [] },
  );

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Tarefas</h1>
          <p className="pageSubtitle">
            {pending.data
              ? `${pending.data.length} pendentes · ${grouped.overdue.length} atrasadas · ${grouped.today.length} para hoje`
              : 'Seus próximos passos com cada cliente.'}
          </p>
        </div>
        <Button onClick={() => setTarget({})}>
          <Plus size={18} />
          Nova tarefa
        </Button>
      </header>

      {pending.isPending ? (
        <div className="skeletonCard" style={{ height: 220 }} />
      ) : pending.isError ? (
        <div className="stateBox stateBox--error" role="alert">
          <h2>Não foi possível carregar as tarefas</h2>
          <p>{getErrorMessage(pending.error)}</p>
        </div>
      ) : pending.data.length === 0 ? (
        <div className="stateBox">
          <CalendarCheck size={28} />
          <h2>Nenhuma tarefa pendente</h2>
          <p>Crie uma tarefa para lembrar do próximo passo com um cliente: ligar, mandar proposta, cobrar retorno.</p>
          <Button onClick={() => setTarget({})}>
            <Plus size={18} /> Nova tarefa
          </Button>
        </div>
      ) : (
        <div className="taskSections">
          {sections.map(({ bucket, title, empty }) => (
            <section key={bucket} className={`taskSection taskSection--${bucket}`}>
              <h2>
                {title} <span>{grouped[bucket].length}</span>
              </h2>
              {grouped[bucket].length > 0 ? (
                <ul className="taskList">
                  {grouped[bucket].map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={(selected) => setTarget({ task: selected })} />
                  ))}
                </ul>
              ) : (
                <p className="taskSectionEmpty">{empty}</p>
              )}
            </section>
          ))}
        </div>
      )}

      <section className="taskSection taskSection--done">
        <button type="button" className="doneToggle" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}>
          {showDone ? 'Esconder concluídas' : 'Mostrar concluídas'}
          {done.data ? ` (${done.data.length})` : ''}
        </button>
        {showDone && done.data && (
          <ul className="taskList">
            {done.data.slice(0, 30).map((task) => (
              <TaskItem key={task.id} task={task} onEdit={() => undefined} />
            ))}
          </ul>
        )}
      </section>

      {target && <TaskFormModal task={target.task} onClose={() => setTarget(null)} />}
    </main>
  );
};
