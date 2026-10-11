export type CustomerStatus = 'LEAD' | 'CUSTOMER' | 'INACTIVE';

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
}

export interface CustomerFilters {
  q?: string;
  status?: CustomerStatus;
  page?: number;
  size?: number;
}

export const statusLabels: Record<CustomerStatus, string> = {
  LEAD: 'Lead',
  CUSTOMER: 'Cliente',
  INACTIVE: 'Inativo',
};
