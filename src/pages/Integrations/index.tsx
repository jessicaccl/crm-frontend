import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Copy, FileInput, Inbox, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { API_ORIGIN, getErrorMessage, integrationsApi } from '../../services/api';
import '../Customers/styles.css';
import './styles.css';

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const Integrations = () => {
  const status = useQuery({ queryKey: ['integrations', 'status'], queryFn: integrationsApi.status });
  const leads = useQuery({
    queryKey: ['integrations', 'leads'],
    queryFn: integrationsApi.recentLeads,
    refetchInterval: 60_000,
  });

  const webhookUrl = `${API_ORIGIN}${status.data?.netlifyWebhookPath ?? '/api/v1/integrations/netlify/forms'}`;
  const enabled = status.data?.netlifyEnabled ?? false;

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success('Endereço copiado');
    } catch {
      toast.error('Não foi possível copiar. Selecione o endereço e copie manualmente.');
    }
  };

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Integrações</h1>
          <p className="pageSubtitle">Leads que chegam sozinhos de outras plataformas.</p>
        </div>
      </header>

      <section className="integrationCard">
        <div className="integrationHead">
          <span className="integrationIcon" aria-hidden="true">
            <FileInput size={22} />
          </span>
          <div className="integrationTitle">
            <h2>Formulários do Netlify</h2>
            <p>Cada envio do formulário vira um Lead e um negócio em Prospecto, com as respostas nas observações.</p>
          </div>
          {status.isPending ? null : (
            <span className={`integrationPill ${enabled ? 'on' : 'off'}`}>{enabled ? 'Ativa' : 'Desativada'}</span>
          )}
        </div>

        {enabled ? (
          <div className="webhookBox">
            <span className="webhookLabel">Endereço do webhook (Netlify → Forms → Form notifications → Outgoing webhook)</span>
            <div className="webhookRow">
              <code>{webhookUrl}</code>
              <Button variant="secondary" onClick={copyWebhook}>
                <Copy size={15} />
                Copiar
              </Button>
            </div>
            <span className="webhookHint">
              No campo "JWS secret token" do Netlify, use o mesmo valor de NETLIFY_WEBHOOK_SECRET da API.
            </span>
          </div>
        ) : (
          !status.isPending && (
            <p className="integrationNote">
              Desativada neste ambiente. No CRM da Unic, cada diagnóstico respondido no site chega aqui automaticamente.
            </p>
          )
        )}
      </section>

      <section className="integrationCard">
        <div className="leadsHeader">
          <h2>Últimos leads recebidos</h2>
          <Button variant="ghost" onClick={() => leads.refetch()} disabled={leads.isFetching}>
            <RefreshCw size={15} className={leads.isFetching ? 'spin' : ''} />
            Atualizar
          </Button>
        </div>

        {leads.isPending ? (
          <p className="integrationNote">Carregando…</p>
        ) : leads.isError ? (
          <p className="integrationNote">{getErrorMessage(leads.error)}</p>
        ) : leads.data.length === 0 ? (
          <div className="leadsEmpty">
            <Inbox size={26} />
            <p>Nenhum lead recebido ainda.</p>
          </div>
        ) : (
          <div className="leadsTableWrap">
            <table className="leadsTable">
              <thead>
                <tr>
                  <th>Recebido em</th>
                  <th>Contato</th>
                  <th>Negócio criado</th>
                  <th>Formulário</th>
                </tr>
              </thead>
              <tbody>
                {leads.data.map((lead) => (
                  <tr key={lead.id}>
                    <td>{dateTime.format(new Date(lead.receivedAt))}</td>
                    <td>{lead.customerName ?? '—'}</td>
                    <td>{lead.dealId ? <Link to="/funil">{lead.dealTitle}</Link> : '—'}</td>
                    <td>{lead.formName ?? lead.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
