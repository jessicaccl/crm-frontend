import { Link } from 'react-router';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { useDeleteTask, useToggleTask } from '../../hooks/useTasks';
import { getErrorMessage } from '../../services/api';
import { taskBucket, type Task } from '../../types/task';
import { formatDue } from '../../utils/format';
import './styles.css';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  /** Na ficha do cliente o nome dele é redundante. */
  showCustomer?: boolean;
}

export const TaskItem = ({ task, onEdit, showCustomer = true }: Props) => {
  const toggle = useToggleTask();
  const remove = useDeleteTask();
  const done = task.doneAt !== null;
  const bucket = done ? null : taskBucket(task);

  return (
    <li className={`taskItem ${done ? 'taskItem--done' : ''}`}>
      <button
        type="button"
        className={`taskCheck ${done ? 'checked' : ''}`}
        aria-label={done ? `Reabrir: ${task.title}` : `Concluir: ${task.title}`}
        aria-pressed={done}
        disabled={toggle.isPending}
        onClick={() =>
          toggle.mutate(
            { id: task.id, done: !done },
            {
              onSuccess: () => toast.success(done ? 'Tarefa reaberta' : 'Tarefa concluída'),
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          )
        }
      >
        {done && <Check size={13} strokeWidth={3} />}
      </button>

      <div className="taskBody">
        <span className="taskTitle">{task.title}</span>
        <span className="taskMeta">
          <span className={`taskDue taskDue--${bucket ?? 'done'}`}>
            {done ? `Concluída ${formatDue(task.doneAt!).toLowerCase()}` : `${bucket === 'overdue' ? 'Atrasada · ' : ''}${formatDue(task.dueAt)}`}
          </span>
          {showCustomer && task.customer && (
            <Link to={`/clientes/${task.customer.id}`} className="taskLink">
              {task.customer.company ?? task.customer.name}
            </Link>
          )}
          {task.deal && <span className="taskDeal">{task.deal.title}</span>}
        </span>
      </div>

      <div className="taskActions">
        {!done && (
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label={`Editar ${task.title}`}>
            <Pencil size={15} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => remove.mutate(task.id, { onError: (error) => toast.error(getErrorMessage(error)) })}
          aria-label={`Excluir ${task.title}`}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </li>
  );
};
