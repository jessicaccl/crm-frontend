import { useSummary } from '../../hooks/useDeals';
import { formatCompactCurrency, formatCurrency, plural } from '../../utils/format';
import './styles.css';

type Tone = 'neutral' | 'up' | 'down' | 'alert';

interface Kpi {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}

export const KpiStrip = () => {
  const { data, isPending, isError } = useSummary();

  if (isPending || isError) {
    return (
      <div className="kpiStrip" aria-busy={isPending}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="kpi kpi--loading">
            {isError && index === 0 && <span className="kpiNote">Indicadores indisponíveis</span>}
          </div>
        ))}
      </div>
    );
  }

  const monthChange =
    data.wonLastMonthValue > 0 ? (data.wonThisMonthValue - data.wonLastMonthValue) / data.wonLastMonthValue : null;

  const kpis: Kpi[] = [
    {
      label: 'Em aberto no funil',
      value: formatCompactCurrency(data.openValue),
      note: plural(data.openCount, 'negócio', 'negócios'),
      tone: 'neutral',
    },
    {
      label: 'Ganho no mês',
      value: formatCurrency(data.wonThisMonthValue),
      note:
        monthChange === null
          ? plural(data.wonThisMonthCount, 'negócio', 'negócios')
          : `${monthChange >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(monthChange * 100))}% vs mês anterior`,
      tone: monthChange === null ? 'neutral' : monthChange >= 0 ? 'up' : 'down',
    },
    {
      label: 'Taxa de conversão',
      value: data.conversionRate === null ? '—' : `${Math.round(data.conversionRate * 100)}%`,
      note: 'ganhos ÷ fechados em 90 dias',
      tone: 'neutral',
    },
    {
      label: `Parados há +${data.stalledDays} dias`,
      value: String(data.stalledCount),
      note: data.stalledCount > 0 ? 'precisam de follow-up' : 'tudo em dia',
      tone: data.stalledCount > 0 ? 'alert' : 'up',
    },
  ];

  return (
    <div className="kpiStrip">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="kpi">
          <span className="kpiLabel">{kpi.label}</span>
          <strong className="kpiValue">{kpi.value}</strong>
          <span className={`kpiNote kpiNote--${kpi.tone}`}>{kpi.note}</span>
        </div>
      ))}
    </div>
  );
};
