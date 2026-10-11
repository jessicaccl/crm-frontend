import { useId, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { getErrorMessage, integrationsApi } from '../../services/api';
import { sourceLabels, type DealSource } from '../../types/deal';
import type { CsvImportResult } from '../../types/integration';
import { plural } from '../../utils/format';
import './styles.css';

/** Importa leads antigos (export do Netlify, Excel, Google Sheets) com a mesma regra do webhook. */
export const CsvImportCard = () => {
  const inputId = useId();
  const sourceId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<DealSource>('WEBSITE');
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const importCsv = useMutation({
    mutationFn: () => integrationsApi.importCsv(file!, source),
    onSuccess: (data) => {
      setResult(data);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      toast.success(
        data.imported > 0 ? `${plural(data.imported, 'lead importado', 'leads importados')}` : 'Nenhum lead novo no arquivo',
      );
      ['deals', 'customers', 'reports', 'integrations'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <section className="integrationCard">
      <div className="integrationHead">
        <span className="integrationIcon csvIcon" aria-hidden="true">
          <FileSpreadsheet size={22} />
        </span>
        <div className="integrationTitle">
          <h2>Importar planilha (CSV)</h2>
          <p>
            Traga leads antigos: o export do Netlify Forms, uma planilha do Excel ou do Google Sheets. Cada linha vira um
            Lead e um negócio em Prospecto, sem duplicar contatos.
          </p>
        </div>
      </div>

      <div className="csvForm">
        <div className="csvField csvFile">
          <label htmlFor={inputId}>Arquivo .csv</label>
          <input
            ref={fileInput}
            id={inputId}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
        </div>
        <div className="csvField">
          <label htmlFor={sourceId}>Origem dos leads</label>
          <select id={sourceId} value={source} onChange={(event) => setSource(event.target.value as DealSource)}>
            {(Object.keys(sourceLabels) as DealSource[]).map((option) => (
              <option key={option} value={option}>
                {sourceLabels[option]}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => importCsv.mutate()} disabled={!file || importCsv.isPending}>
          {importCsv.isPending ? <LoaderCircle size={16} className="spin" /> : <Upload size={16} />}
          Importar
        </Button>
      </div>

      <p className="csvHint">
        Colunas reconhecidas: nome, telefone ou WhatsApp, e-mail, empresa, resultado, placar e data (em português ou
        inglês, separadas por vírgula ou ponto e vírgula). Outras colunas vão para as observações do negócio. Importar o
        mesmo arquivo de novo não cria nada repetido.
      </p>

      {result && (
        <div className="csvResult" role="status">
          <strong>
            {plural(result.imported, 'lead importado', 'leads importados')}
            {result.imported > 0 && ` (${plural(result.newCustomers, 'contato novo', 'contatos novos')})`}
          </strong>
          <ul>
            <li>{plural(result.rows, 'linha lida', 'linhas lidas')}</li>
            {result.duplicates > 0 && <li>{plural(result.duplicates, 'linha já importada antes', 'linhas já importadas antes')}</li>}
            {result.skipped > 0 && <li>{plural(result.skipped, 'linha ignorada', 'linhas ignoradas')}</li>}
            <li>Colunas usadas: {result.recognizedColumns.join(', ')}</li>
            {result.extraColumns.length > 0 && <li>Nas observações: {result.extraColumns.join(', ')}</li>}
          </ul>
          {result.issues.length > 0 && (
            <ul className="csvIssues">
              {result.issues.map((issue) => (
                <li key={issue.line}>
                  Linha {issue.line}: {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
