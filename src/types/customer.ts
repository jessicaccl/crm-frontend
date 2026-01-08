export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'CLOSED';
  createdAt?: string;
}