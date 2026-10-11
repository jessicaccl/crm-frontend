export interface IntegrationStatus {
  netlifyEnabled: boolean;
  netlifyWebhookPath: string;
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
