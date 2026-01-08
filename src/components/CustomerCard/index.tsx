import { type Customer } from '../../types/customer';
import './styles.css';

interface Props {
  customer: Customer;
}

const statusTranslations: Record<string, string> = {
  PROSPECT: 'Prospecto',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Em Proposta',
  CLOSED: 'Fechado'
};

export const CustomerCard = ({ customer }: Props) => {
  return (
    <div className="card">
      <h3>{customer.name}</h3>
      <p>{customer.email}</p>
      
     <span className={`status ${customer.status}`}>
        {statusTranslations[customer.status] || customer.status}
      </span>
    </div>
  );
};