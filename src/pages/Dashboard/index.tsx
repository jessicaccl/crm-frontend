import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '../../components/Button';
import { getErrorMessage, reportsApi } from '../../services/api';
import type { Dashboard as DashboardData } from '../../types/dashboard';
import { sourceLabels, stageLabels } from '../../types/deal';
import { formatCompactCurrency, formatCurrency, plural } from '../../utils/format';
import '../Customers/styles.css';
import '../../components/KpiStrip/styles.css';
import './styles.css';

const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

function monthName(month: string) {
  const [year, number] = month.split('-').map(Number);
  return monthLabel.format(new Date(year, number - 1, 1)).replace('.', '');
}

/** Teto "redondo" para o eixo: 30.800 → 40.000. */
function niceMax(value: number) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  return (steps.find((step) => step * magnitude >= value) ?? 10) * magnitude;
}

const RevenueChart = ({ months }: { months: DashboardData['revenueByMonth'] }) => {
  // Proporção próxima da largura real do card, para o texto não crescer demais
  const width = 1040;
  const height = 300;
  const padding = { top: 28, right: 12, bottom: 32, left: 60 };
  const max = niceMax(Math.max(...months.map((month) => month.value)));
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const slot = plotWidth / months.length;
  const barWidth = Math.min(46, slot * 0.6);
  const y = (value: number) => padding.top + plotHeight - (value / max) * plotHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * max);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="revenueChart" role="img" aria-label="Receita ganha por mês">
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="gridLine" />
          <text x={padding.left - 8} y={y(tick) + 4} className="axisLabel" textAnchor="end">
            {formatCompactCurrency(tick).replace('R$', '').trim()}
          </text>
        </g>
      ))}
      {months.map((month, index) => {
        const x = padding.left + slot * index + (slot - barWidth) / 2;
        const isCurrent = index === months.length - 1;
        return (
          <g key={month.month}>
            {month.value > 0 && (
              <>
                <rect
                  x={x}
                  y={y(month.value)}
                  width={barWidth}
                  height={padding.top + plotHeight - y(month.value)}
                  rx={5}
                  className={isCurrent ? 'bar barCurrent' : 'bar'}
                >
                  <title>
                    {monthName(month.month)}: {formatCurrency(month.value)} ({plural(month.count, 'venda', 'vendas')})
                  </title>
                </rect>
                <text x={x + barWidth / 2} y={y(month.value) - 6} className="barValue" textAnchor="middle">
                  {formatCompactCurrency(month.value).replace('R$', '').trim()}
                </text>
              </>
            )}
            <text x={x + barWidth / 2} y={height - 8} className="axisLabel" textAnchor="middle">
              {monthName(month.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const Dashboard = () => {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
  });

  if (isPending) {
    return (
      <main className="container">
        <header className="pageHeader">
          <h1>Painel de resultados</h1>
        </header>
        <div className="dashboardGrid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="skeletonCard" style={{ height: 220 }} />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container">
        <div className="stateBox stateBox--error" role="alert">
          <TriangleAlert size={28} />
          <h2>Não foi possível carregar o painel</h2>
          <p>{getErrorMessage(error)}</p>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} /> Tentar novamente
          </Button>
        </div>
      </main>
    );
  }

  const revenueTotal = data.revenueByMonth.reduce((sum, month) => sum + month.value, 0);
  const salesTotal = data.revenueByMonth.reduce((sum, month) => sum + month.count, 0);
  const entered = data.funnel[0]?.reached ?? 0;
  const maxSourceDeals = Math.max(1, ...data.sources.map((source) => source.deals));
  const maxLost = Math.max(1, ...data.lostReasons.map((reason) => reason.count));

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Painel de resultados</h1>
          <p className="pageSubtitle">
            Receita dos últimos 6 meses · funil, origens e perdas dos últimos {data.windowDays} dias
          </p>
        </div>
      </header>

      <div className="kpiStrip">
        <div className="kpi">
          <span className="kpiLabel">Receita em 6 meses</span>
          <strong className="kpiValue">{formatCompactCurrency(revenueTotal)}</strong>
          <span className="kpiNote">{plural(salesTotal, 'venda', 'vendas')}</span>
        </div>
        <div className="kpi">
          <span className="kpiLabel">Ticket médio</span>
          <strong className="kpiValue">{data.averageTicket === null ? '—' : formatCurrency(data.averageTicket)}</strong>
          <span className="kpiNote">vendas dos últimos {data.windowDays} dias</span>
        </div>
        <div className="kpi">
          <span className="kpiLabel">Ciclo médio de venda</span>
          <strong className="kpiValue">
            {data.averageCycleDays === null ? '—' : `${Math.round(data.averageCycleDays)} dias`}
          </strong>
          <span className="kpiNote">da entrada no funil até o ganho</span>
        </div>
        <div className="kpi">
          <span className="kpiLabel">Previsão ponderada</span>
          <strong className="kpiValue">{formatCompactCurrency(data.forecast.weightedValue)}</strong>
          <span className="kpiNote">de {formatCompactCurrency(data.forecast.openValue)} em aberto</span>
        </div>
      </div>

      <div className="dashboardGrid">
        <section className="dashCard dashCard--wide">
          <h2>Receita ganha por mês</h2>
          <RevenueChart months={data.revenueByMonth} />
        </section>

        <section className="dashCard">
          <h2>
            Funil de conversão <span>{plural(entered, 'negócio entrou', 'negócios entraram')}</span>
          </h2>
          {entered === 0 ? (
            <p className="dashEmpty">Nenhum negócio entrou no funil nos últimos {data.windowDays} dias.</p>
          ) : (
            <ol className="funnelList">
              {data.funnel.map((step) => (
                <li key={step.stage}>
                  <span className="funnelLabel">{stageLabels[step.stage]}</span>
                  <span className="funnelTrack">
                    <span
                      className={`funnelBar funnelBar--${step.stage}`}
                      style={{ width: `${Math.max(step.rate * 100, 2)}%` }}
                    />
                  </span>
                  <span className="funnelNumbers">
                    <strong>{Math.round(step.rate * 100)}%</strong> {step.reached}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="dashHint">Quantos dos negócios que entraram chegaram a cada etapa (ou além).</p>
        </section>

        <section className="dashCard">
          <h2>Origem dos negócios</h2>
          {data.sources.length === 0 ? (
            <p className="dashEmpty">Sem negócios no período.</p>
          ) : (
            <ul className="sourceList">
              {data.sources.map((source) => (
                <li key={source.source}>
                  <span className="sourceLabel">{sourceLabels[source.source]}</span>
                  <span className="sourceTrack">
                    <span className="sourceBar" style={{ width: `${(source.deals / maxSourceDeals) * 100}%` }} />
                  </span>
                  <span className="sourceNumbers">
                    {source.deals} · {source.won} {source.won === 1 ? 'ganho' : 'ganhos'}
                    {source.wonValue > 0 && <small>{formatCompactCurrency(source.wonValue)}</small>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashCard">
          <h2>Previsão por etapa</h2>
          <table className="forecastTable">
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Chance</th>
                <th>Em aberto</th>
                <th>Previsto</th>
              </tr>
            </thead>
            <tbody>
              {data.forecast.byStage.map((row) => (
                <tr key={row.stage}>
                  <td>
                    {stageLabels[row.stage]} <small>({row.deals})</small>
                  </td>
                  <td>{Math.round(row.probability * 100)}%</td>
                  <td>{formatCompactCurrency(row.value)}</td>
                  <td>
                    <strong>{formatCompactCurrency(row.weighted)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dashHint">Valor em aberto multiplicado pela chance de fechamento de cada etapa.</p>
        </section>

        <section className="dashCard">
          <h2>Principais motivos de perda</h2>
          {data.lostReasons.length === 0 ? (
            <p className="dashEmpty">Nenhuma perda nos últimos {data.windowDays} dias. 🎉</p>
          ) : (
            <ul className="sourceList">
              {data.lostReasons.map((reason) => (
                <li key={reason.reason}>
                  <span className="sourceLabel lostLabel">{reason.reason}</span>
                  <span className="sourceTrack">
                    <span className="sourceBar lostBar" style={{ width: `${(reason.count / maxLost) * 100}%` }} />
                  </span>
                  <span className="sourceNumbers">{reason.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashCard dashCard--wide">
          <h2>
            Negócios parados <span>sem mudar de etapa há 7+ dias</span>
          </h2>
          {data.stalled.length === 0 ? (
            <p className="dashEmpty">Tudo andando. Nenhum negócio parado.</p>
          ) : (
            <div className="tableWrap">
              <table className="forecastTable stalledTable">
                <thead>
                  <tr>
                    <th>Negócio</th>
                    <th>Cliente</th>
                    <th>Etapa</th>
                    <th>Parado há</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stalled.map((deal) => (
                    <tr key={deal.id}>
                      <td>
                        <Link to="/funil">{deal.title}</Link>
                      </td>
                      <td>{deal.customer}</td>
                      <td>{stageLabels[deal.stage]}</td>
                      <td className="stalledDays">{deal.days} dias</td>
                      <td>{formatCurrency(deal.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
