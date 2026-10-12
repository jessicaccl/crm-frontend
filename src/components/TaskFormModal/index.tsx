import { useId, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { useDeals } from '../../hooks/useDeals';
import { useSaveTask } from '../../hooks/useTasks';
import { customersApi, getErrorMessage } from '../../services/api';
import type { Task } from '../../types/task';
import { fromDateTimeInputs, toDateTimeInputs } from '../../utils/format';
import '../CustomerFormModal/styles.css';

interface Props {
  task?: Task;
  initialCustomerId?: number;
  initialDealId?: number;
  onClose: () => void;
}

/** Amanhã às 9h: um bom padrão para "próximo passo". */
function defaultDue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return toDateTimeInputs(date.toISOString());
}

export const TaskFormModal = ({ task, initialCustomerId, initialDealId, onClose }: Props) => {
  const formId = useId();
  const save = useSaveTask();
  const deals = useDeals();
  const customers = useQuery({
    queryKey: ['customers', 'options'],
    queryFn: () => customersApi.list({ size: 200, sort: 'name,asc' }),
  });

  const initial = task ? toDateTimeInputs(task.dueAt) : defaultDue();
  const [title, setTitle] = useState(task?.title ?? '');
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [customerId, setCustomerId] = useState<number | ''>(task?.customer?.id ?? initialCustomerId ?? '');
  const [dealId, setDealId] = useState<number | ''>(task?.deal?.id ?? initialDealId ?? '');
  const [error, setError] = useState<string | null>(null);

  // Só os negócios do cliente escolhido (ou todos, se nenhum cliente)
  const dealOptions = (deals.data ?? []).filter((deal) => customerId === '' || deal.customer.id === customerId);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError('Descreva a tarefa');
    if (!date) return setError('Informe a data');
    setError(null);
    save.mutate(
      {
        id: task?.id,
        data: {
          title: title.trim(),
          dueAt: fromDateTimeInputs(date, time),
          customerId: customerId === '' ? null : customerId,
          dealId: dealId === '' ? null : dealId,
        },
      },
      {
        onSuccess: () => {
          toast.success(task ? 'Tarefa atualizada' : 'Tarefa criada');
          onClose();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <Modal
      title={task ? 'Editar tarefa' : 'Nova tarefa'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={save.isPending}>
            {save.isPending && <LoaderCircle size={16} className="spin" />}
            {task ? 'Salvar' : 'Criar tarefa'}
          </Button>
        </>
      }
    >
      <form id={formId} className="customerForm" onSubmit={onSubmit} noValidate>
        <div className="formField formField--full">
          <label htmlFor={`${formId}-title`}>O que precisa ser feito? *</label>
          <input
            id={`${formId}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Ligar para confirmar a reunião"
            maxLength={200}
            autoFocus
          />
        </div>
        <div className="formField">
          <label htmlFor={`${formId}-date`}>Data *</label>
          <input id={`${formId}-date`} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="formField">
          <label htmlFor={`${formId}-time`}>Horário</label>
          <input id={`${formId}-time`} type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </div>
        <div className="formField formField--full">
          <label htmlFor={`${formId}-customer`}>Cliente</label>
          <select
            id={`${formId}-customer`}
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value === '' ? '' : Number(event.target.value));
              setDealId('');
            }}
          >
            <option value="">Nenhum</option>
            {customers.data?.content.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.company ? `${customer.company} · ${customer.name}` : customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="formField formField--full">
          <label htmlFor={`${formId}-deal`}>Negócio</label>
          <select
            id={`${formId}-deal`}
            value={dealId}
            onChange={(event) => setDealId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            <option value="">Nenhum</option>
            {dealOptions.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
                {customerId === '' ? ` (${deal.customer.company ?? deal.customer.name})` : ''}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="fieldError formField--full" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
