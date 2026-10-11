export interface IntegrationStatus {
  /** Falso na organização de demonstração. */
  available: boolean;
  /** Já existe chave para o webhook do Netlify. */
  netlifyConfigured: boolean;
  netlifyWebhookPath: string;
}

export interface CsvImportResult {
  rows: number;
  imported: number;
  newCustomers: number;
  duplicates: number;
  skipped: number;
  issues: { line: number; message: string }[];
  recognizedColumns: string[];
  extraColumns: string[];
}

export interface InboundLead {
  id: number;
  provider: string;
  formName: string | null;
  customerId: number | null;
  customerName: string | null;
  dealId: number | null;
  dealTitle: string | null;
  receivedAt: string;
}
