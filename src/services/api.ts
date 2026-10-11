import axios, { isAxiosError } from 'axios';
import type { Page, ProblemDetail } from '../types/api';
import type { Customer, CustomerFilters, CustomerInput } from '../types/customer';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
});

export const customersApi = {
  list: (filters: CustomerFilters) =>
    api.get<Page<Customer>>('/customers', { params: filters }).then((res) => res.data),
  create: (data: CustomerInput) =>
    api.post<Customer>('/customers', data).then((res) => res.data),
  update: (id: number, data: CustomerInput) =>
    api.put<Customer>(`/customers/${id}`, data).then((res) => res.data),
  remove: (id: number) => api.delete(`/customers/${id}`),
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
