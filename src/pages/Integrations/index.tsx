import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Copy, FileInput, Inbox, KeyRound, LoaderCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { CsvImportCard } from '../../components/CsvImportCard';
import { useAuth } from '../../context/auth-context';
import { API_ORIGIN, getErrorMessage, integrationsApi } from '../../services/api';
import '../Customers/styles.css';
import './styles.css';

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error('Não foi possível copiar. Selecione o texto e copie manualmente.');
  }
}

export const Integrations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const status = useQuery({ queryKey: ['integrations', 'status'], queryFn: integrationsApi.status });
  const leads = useQuery({
    queryKey: ['integrations', 'leads'],
    queryFn: integrationsApi.recentLeads,
    refetchInterval: 60_000,
  });

  const regenerate = useMutation({
    mutationFn: integrationsApi.regenerateNetlifySecret,
    onSuccess: (secret) => {
      setNewSecret(secret);
      setConfirmRegenerate(false);
      queryClient.invalidateQueries({ queryKey: ['integrations', 'status'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const webhookUrl = status.data ? `${API_ORIGIN}${status.data.netlifyWebhookPath}` : '';
  const configured = status.data?.netlifyConfigured ?? false;

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Integrações</h1>
          <p className="pageSubtitle">
            Leads que chegam sozinhos de outras plataformas
            {user?.organization ? ` para ${user.organization.name}` : ''}.
          </p>
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
          {status.data && (
            <span className={`integrationPill ${configured ? 'on' : 'off'}`}>
              {!status.data.available ? 'Indisponível' : configured ? 'Ativa' : 'Não configurada'}
            </span>
          )}
        </div>

        {status.data && !status.data.available && (
          <p className="integrationNote">
            Indisponível na organização de demonstração. Nas empresas reais, cada formulário respondido no site chega aqui
            automaticamente.
          </p>
        )}

        {status.data?.available && (
          <div className="webhookBox">
            <span className="webhookLabel">
              1. Endereço do webhook (Netlify → Forms → Form notifications → Outgoing webhook → URL to notify)
            </span>
            <div className="webhookRow">
              <code>{webhookUrl}</code>
              <Button variant="secondary" onClick={() => copy(webhookUrl, 'Endereço')}>
                <Copy size={15} />
                Copiar
              </Button>
            </div>

            <span className="webhookLabel">2. Chave secreta (campo "JWS secret token" no Netlify)</span>
            {newSecret ? (
              <>
                <div className="webhookRow">
                  <code className="secretValue">{newSecret}</code>
                  <Button variant="secondary" onClick={() => copy(newSecret, 'Chave')}>
                    <Copy size={15} />
                    Copiar
                  </Button>
                </div>
                <span className="webhookWarning">
                  Copie e cole no Netlify agora: por segurança, esta chave não será mostrada de novo.
                </span>
              </>
            ) : isAdmin ? (
              <div className="webhookRow">
                <span className="webhookHint">
                  {configured
                    ? 'Uma chave já está configurada. Gere outra só se precisar trocar (a anterior deixa de funcionar).'
                    : 'Gere a chave que o Netlify vai usar para assinar os envios.'}
                </span>
                <Button
                  variant={configured ? 'secondary' : 'primary'}
                  onClick={() => (configured ? setConfirmRegenerate(true) : regenerate.mutate())}
                  disabled={regenerate.isPending}
                >
                  {regenerate.isPending ? <LoaderCircle size={15} className="spin" /> : <KeyRound size={15} />}
                  {configured ? 'Gerar nova chave' : 'Gerar chave'}
                </Button>
              </div>
            ) : (
              <span className="webhookHint">Peça a uma administradora para gerar a chave.</span>
            )}
          </div>
        )}
      </section>

      <CsvImportCard />

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
                  <th>Origem</th>
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

      {confirmRegenerate && (
        <ConfirmDialog
          title="Gerar nova chave?"
          confirmLabel="Gerar nova chave"
          isLoading={regenerate.isPending}
          onConfirm={() => regenerate.mutate()}
          onClose={() => setConfirmRegenerate(false)}
        >
          A chave atual deixa de funcionar na hora. Os envios do Netlify só voltam a chegar depois que você colar a nova
          chave lá.
        </ConfirmDialog>
      )}
    </main>
  );
};
