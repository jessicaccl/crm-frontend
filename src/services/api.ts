import axios, { isAxiosError } from 'axios';
import type { Page, ProblemDetail } from '../types/api';
import type { Customer, CustomerFilters, CustomerInput } from '../types/customer';
import type { Deal, DealInput, DealSource, DealStage, SummaryReport } from '../types/deal';
import type { LoginResponse } from '../types/auth';
import type { CsvImportResult, InboundLead, IntegrationStatus } from '../types/integration';
import { getToken, SESSION_EXPIRED_EVENT } from './session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
});

// Envia o token em toda requisição
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 fora do login = sessão expirada: avisa o AuthProvider para voltar à tela de login
api.interceptors.response.use(undefined, (error) => {
  if (isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  return Promise.reject(error);
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((res) => res.data),
};

export const customersApi = {
  list: (filters: CustomerFilters) =>
    api.get<Page<Customer>>('/customers', { params: filters }).then((res) => res.data),
  create: (data: CustomerInput) =>
    api.post<Customer>('/customers', data).then((res) => res.data),
  update: (id: number, data: CustomerInput) =>
    api.put<Customer>(`/customers/${id}`, data).then((res) => res.data),
  remove: (id: number) => api.delete(`/customers/${id}`),
};

export const dealsApi = {
  list: () => api.get<Deal[]>('/deals').then((res) => res.data),
  create: (data: DealInput) => api.post<Deal>('/deals', data).then((res) => res.data),
  update: (id: number, data: DealInput) => api.put<Deal>(`/deals/${id}`, data).then((res) => res.data),
  changeStage: (id: number, stage: DealStage, lostReason?: string) =>
    api.patch<Deal>(`/deals/${id}/stage`, { stage, lostReason }).then((res) => res.data),
  remove: (id: number) => api.delete(`/deals/${id}`),
};

export const integrationsApi = {
  status: () => api.get<IntegrationStatus>('/integrations/status').then((res) => res.data),
  recentLeads: () => api.get<InboundLead[]>('/integrations/leads').then((res) => res.data),
  importCsv: (file: File, source: DealSource) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<CsvImportResult>('/integrations/import/csv', form, { params: { source } })
      .then((res) => res.data);
  },
  regenerateNetlifySecret: () =>
    api.post<{ secret: string }>('/integrations/netlify/secret').then((res) => res.data.secret),
};

/** Endereço público da API, sem o /api/v1 (ex.: para montar a URL do webhook). */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');

export const reportsApi = {
  summary: () => api.get<SummaryReport>('/reports/summary').then((res) => res.data),
};

export function getProblem(error: unknown): ProblemDetail | null {
  if (isAxiosError<ProblemDetail>(error) && error.response?.data?.status) {
    return error.response.data;
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  const problem = getProblem(error);
  if (problem) return problem.detail ?? problem.title;
  if (isAxiosError(error) && !error.response) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
  }
  return 'Algo deu errado. Tente novamente.';
}

export default api;
