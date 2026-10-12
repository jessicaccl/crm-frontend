import { Link } from 'react-router';
import { Building2, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { type Customer } from '../../types/customer';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import './styles.css';

interface Props {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export const CustomerCard = ({ customer, onEdit, onDelete }: Props) => {
  return (
    <article className="card">
      <header className="cardHeader">
        <span className="avatar" aria-hidden="true">{initials(customer.name)}</span>
        <div className="cardTitle">
          <h3>
            <Link to={`/clientes/${customer.id}`} className="cardNameLink">
              {customer.name}
            </Link>
          </h3>
          {customer.company && (
            <p className="cardCompany">
              <Building2 size={13} /> {customer.company}
            </p>
          )}
        </div>
      </header>

      <dl className="cardInfo">
        <div>
          <dt className="sr-only">E-mail</dt>
          <dd>
            <Mail size={14} />
            {customer.email ?? <span className="muted">sem e-mail</span>}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Telefone</dt>
          <dd>
            <Phone size={14} />
            {customer.phone ?? <span className="muted">sem telefone</span>}
          </dd>
        </div>
      </dl>

      <footer className="cardFooter">
        <div className="cardMeta">
          <StatusBadge status={customer.status} />
          <span className="muted">desde {dateFormat.format(new Date(customer.createdAt))}</span>
        </div>
        <div className="cardActions">
          <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} aria-label={`Editar ${customer.name}`}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(customer)} aria-label={`Excluir ${customer.name}`}>
            <Trash2 size={16} />
          </Button>
        </div>
      </footer>
    </article>
  );
};
