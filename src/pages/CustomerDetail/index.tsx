import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  CalendarCheck,
  FileInput,
  Mail,
  MessageCircle,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { CustomerFormModal } from '../../components/CustomerFormModal';
import { DealFormModal } from '../../components/DealFormModal';
import { StatusBadge } from '../../components/StatusBadge';
import { TaskFormModal } from '../../components/TaskFormModal';
import { TaskItem } from '../../components/TaskItem';
import { useDeals } from '../../hooks/useDeals';
import { useAddActivity, useDeleteActivity, useTasks, useTimeline } from '../../hooks/useTasks';
import { customersApi, getErrorMessage } from '../../services/api';
import { activityLabels, type ActivityType, type TimelineItem, type TimelineKind } from '../../types/activity';
import { isOpenStage, stageLabels, type Deal } from '../../types/deal';
import type { Task } from '../../types/task';
import { formatCompactCurrency, formatCurrency, formatDateTime } from '../../utils/format';
import '../Customers/styles.css';
import '../../components/TaskItem/styles.css';
import './styles.css';

const kindIcons: Record<TimelineKind, LucideIcon> = {
  NOTE: NotebookPen,
  CALL: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: Users,
  STAGE_CHANGE: ArrowRightLeft,
  LEAD_RECEIVED: FileInput,
  TASK_DONE: CalendarCheck,
};

function timelineTitle(item: TimelineItem) {
  if (item.kind in activityLabels) {
    const label = activityLabels[item.kind as ActivityType];
    return item.author ? `${label} · ${item.author}` : label;
  }
  return item.title ?? '';
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const ActivityComposer = ({ customerId, deals }: { customerId: number; deals: Deal[] }) => {
  const id = useId();
  const add = useAddActivity(customerId);
  const [type, setType] = useState<ActivityType>('NOTE');
  const [content, setContent] = useState('');
  const [dealId, setDealId] = useState<number | ''>('');

  const submit = () => {
    if (!content.trim()) return;
    add.mutate(
      { type, content: content.trim(), dealId: dealId === '' ? null : dealId },
      {
        onSuccess: () => {
          setContent('');
          toast.success('Registrado na linha do tempo');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="composer">
      <div className="composerTypes" role="group" aria-label="Tipo de registro">
        {(Object.keys(activityLabels) as ActivityType[]).map((option) => {
          const Icon = kindIcons[option];
          return (
            <button
              key={option}
              type="button"
              className={type === option ? 'active' : ''}
              aria-pressed={type === option}
              onClick={() => setType(option)}
            >
              <Icon size={14} />
              {activityLabels[option]}
            </button>
          );
        })}
      </div>
      <label htmlFor={`${id}-content`} className="sr-only">
        O que aconteceu
      </label>
      <textarea
        id={`${id}-content`}
        rows={3}
        value={content}
        maxLength={5000}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit();
        }}
        placeholder={type === 'CALL' ? 'Como foi a ligação? Próximos passos…' : 'O que aconteceu? (Ctrl + Enter para salvar)'}
      />
      <div className="composerFooter">
        {deals.length > 0 && (
          <select
            aria-label="Negócio relacionado"
            value={dealId}
            onChange={(event) => setDealId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            <option value="">Sem negócio específico</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        )}
        <Button onClick={submit} disabled={!content.trim() || add.isPending}>
          Registrar
        </Button>
      </div>
    </div>
  );
};

export const CustomerDetail = () => {
  const customerId = Number(useParams().id);
  const customer = useQuery({ queryKey: ['customers', 'detail', customerId], queryFn: () => customersApi.get(customerId) });
  const deals = useDeals();
  const tasks = useTasks({ done: false, customerId });
  const timeline = useTimeline(customerId);
  const removeActivity = useDeleteActivity(customerId);

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [dealTarget, setDealTarget] = useState<{ deal?: Deal } | null>(null);
  const [taskTarget, setTaskTarget] = useState<{ task?: Task } | null>(null);

  if (customer.isPending) {
    return (
      <main className="container">
        <div className="skeletonCard" style={{ height: 140 }} />
      </main>
    );
  }

  if (customer.isError) {
    return (
      <main className="container">
        <div className="stateBox stateBox--error" role="alert">
          <h2>Cliente não encontrado</h2>
          <p>{getErrorMessage(customer.error)}</p>
          <Link to="/clientes">Voltar para clientes</Link>
        </div>
      </main>
    );
  }

  const data = customer.data;
  const customerDeals = (deals.data ?? []).filter((deal) => deal.customer.id === customerId);
  const openDeals = customerDeals.filter((deal) => isOpenStage(deal.stage));
  const wonValue = customerDeals.filter((deal) => deal.stage === 'WON').reduce((sum, deal) => sum + deal.value, 0);
  const whatsappDigits = data.phone?.replace(/\D/g, '');

  return (
    <main className="container">
      <Link to="/clientes" className="backLink">
        <ArrowLeft size={16} /> Clientes
      </Link>

      <header className="customerHeader">
        <span className="customerAvatar" aria-hidden="true">
          {initials(data.name)}
        </span>
        <div className="customerHeadInfo">
          <div className="customerHeadTitle">
            <h1>{data.name}</h1>
            <StatusBadge status={data.status} />
          </div>
          <div className="customerContacts">
            {data.company && (
              <span>
                <Building2 size={14} /> {data.company}
              </span>
            )}
            {data.email && (
              <span>
                <Mail size={14} /> {data.email}
              </span>
            )}
            {data.phone && (
              <span>
                <Phone size={14} /> {data.phone}
                {whatsappDigits && whatsappDigits.length >= 10 && (
                  <a href={`https://wa.me/55${whatsappDigits}`} target="_blank" rel="noreferrer" className="whatsLink">
                    WhatsApp
                  </a>
                )}
              </span>
            )}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditingCustomer(true)}>
          <Pencil size={15} /> Editar
        </Button>
      </header>

      <div className="customerFacts">
        <div>
          <span>Em aberto</span>
          <strong>{formatCompactCurrency(openDeals.reduce((sum, deal) => sum + deal.value, 0))}</strong>
          <small>{openDeals.length === 1 ? '1 negócio' : `${openDeals.length} negócios`}</small>
        </div>
        <div>
          <span>Já ganho</span>
          <strong>{formatCurrency(wonValue)}</strong>
          <small>com este cliente</small>
        </div>
        <div>
          <span>Tarefas pendentes</span>
          <strong>{tasks.data?.length ?? '—'}</strong>
          <small>{tasks.data?.[0] ? 'próxima abaixo' : 'nenhuma'}</small>
        </div>
        <div>
          <span>Cliente desde</span>
          <strong>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</strong>
          <small>no CRM</small>
        </div>
      </div>

      <div className="customerGridDetail">
        <section className="detailCard">
          <h2>Linha do tempo</h2>
          <ActivityComposer customerId={customerId} deals={customerDeals} />

          {timeline.isPending ? (
            <p className="muted">Carregando…</p>
          ) : timeline.isError ? (
            <p className="muted">{getErrorMessage(timeline.error)}</p>
          ) : timeline.data.length === 0 ? (
            <p className="timelineEmpty">Nada registrado ainda. Anote a primeira conversa com este cliente.</p>
          ) : (
            <ol className="timeline">
              {timeline.data.map((item, index) => {
                const Icon = kindIcons[item.kind];
                return (
                  <li key={`${item.kind}-${item.activityId ?? index}-${item.at}`} className={`timelineItem kind-${item.kind}`}>
                    <span className="timelineDot" aria-hidden="true">
                      <Icon size={14} />
                    </span>
                    <div className="timelineBody">
                      <div className="timelineHead">
                        <strong>{timelineTitle(item)}</strong>
                        <time dateTime={item.at}>{formatDateTime(item.at)}</time>
                        {item.activityId !== null && (
                          <button
                            type="button"
                            className="timelineDelete"
                            aria-label="Excluir registro"
                            onClick={() => removeActivity.mutate(item.activityId!)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      {item.detail && <p className="timelineDetail">{item.detail}</p>}
                      {item.dealTitle && <span className="timelineDeal">{item.dealTitle}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="detailSide">
          <section className="detailCard">
            <div className="detailCardHead">
              <h2>Tarefas</h2>
              <Button variant="ghost" onClick={() => setTaskTarget({})}>
                <Plus size={15} /> Tarefa
              </Button>
            </div>
            {tasks.data && tasks.data.length > 0 ? (
              <ul className="taskList">
                {tasks.data.map((task) => (
                  <TaskItem key={task.id} task={task} showCustomer={false} onEdit={(selected) => setTaskTarget({ task: selected })} />
                ))}
              </ul>
            ) : (
              <p className="muted small">Nenhuma tarefa pendente.</p>
            )}
          </section>

          <section className="detailCard">
            <div className="detailCardHead">
              <h2>Negócios</h2>
              <Button variant="ghost" onClick={() => setDealTarget({})}>
                <Plus size={15} /> Negócio
              </Button>
            </div>
            {customerDeals.length > 0 ? (
              <ul className="dealMiniList">
                {customerDeals.map((deal) => (
                  <li key={deal.id}>
                    <button type="button" onClick={() => setDealTarget({ deal })}>
                      <span className="dealMiniTitle">{deal.title}</span>
                      <span className={`dealMiniStage stage-${deal.stage}`}>{stageLabels[deal.stage]}</span>
                      <span className="dealMiniValue">{formatCurrency(deal.value)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">Nenhum negócio com este cliente.</p>
            )}
          </section>
        </div>
      </div>

      {editingCustomer && <CustomerFormModal customer={data} onClose={() => setEditingCustomer(false)} />}
      {dealTarget && (
        <DealFormModal deal={dealTarget.deal} initialCustomerId={customerId} onClose={() => setDealTarget(null)} />
      )}
      {taskTarget && (
        <TaskFormModal task={taskTarget.task} initialCustomerId={customerId} onClose={() => setTaskTarget(null)} />
      )}
    </main>
  );
};
