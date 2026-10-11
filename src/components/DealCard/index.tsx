import type { HTMLAttributes, Ref } from 'react';
import type { Deal } from '../../types/deal';
import { daysSince, daysUntil, formatCurrency, formatShortDate } from '../../utils/format';
import './styles.css';

export const STALLED_DAYS = 7;

interface Props extends HTMLAttributes<HTMLDivElement> {
  deal: Deal;
  isDragging?: boolean;
  isOverlay?: boolean;
  ref?: Ref<HTMLDivElement>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Linha de status do card: tempo na etapa, prazo, ou como terminou. */
function statusLine(deal: Deal): { text: string; late?: boolean } {
  if (deal.stage === 'WON') return { text: `ganho em ${formatShortDate(deal.closedAt ?? deal.stageChangedAt)}` };
  if (deal.stage === 'LOST') return { text: deal.lostReason ?? 'perdido' };

  if (deal.expectedCloseDate) {
    const until = daysUntil(deal.expectedCloseDate);
    if (until < 0) return { text: 'previsão de fechamento vencida', late: true };
    if (until === 0) return { text: 'previsão de fechamento: hoje', late: true };
    if (until === 1) return { text: 'previsão de fechamento: amanhã', late: true };
  }

  const days = daysSince(deal.stageChangedAt);
  if (days >= STALLED_DAYS) return { text: `parado há ${days} dias`, late: true };
  if (days === 0) return { text: 'entrou hoje nesta etapa' };
  return { text: `${days} ${days === 1 ? 'dia' : 'dias'} nesta etapa` };
}

export const DealCard = ({ deal, isDragging, isOverlay, ref, className = '', ...rest }: Props) => {
  const status = statusLine(deal);

  return (
    <div
      ref={ref}
      className={`dealCard ${isDragging ? 'dealCard--placeholder' : ''} ${isOverlay ? 'dealCard--overlay' : ''} ${className}`}
      {...rest}
    >
      <span className="dealTitle">{deal.title}</span>
      <span className="dealCustomer">{deal.customer.company ?? deal.customer.name}</span>
      <div className="dealRow">
        <span className="dealValue">{formatCurrency(deal.value)}</span>
        <span className="dealAvatar" title={deal.customer.name}>
          {initials(deal.customer.name)}
        </span>
      </div>
      <span
        className={`dealStatus ${status.late ? 'dealStatus--late' : ''} ${
          deal.stage === 'LOST' ? 'dealStatus--lost' : ''
        } ${deal.stage === 'WON' ? 'dealStatus--won' : ''}`}
      >
        {status.text}
      </span>
    </div>
  );
};
