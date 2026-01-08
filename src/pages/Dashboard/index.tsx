import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api'; 
import { type Customer } from '../../types/customer';
import { CustomerCard } from '../../components/CustomerCard';
import { Button } from '../../components/Button';
import './styles.css';

export const Dashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    api.get('/customers')
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Erro:", error));
  }, []);

  return (
    <main className={"container"}>
      <header className={"header"}>
        <div>
          <h1>Clientes</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Gerencie seus leads e oportunidades.
          </p>
        </div>
        <Button variant="primary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            Novo Cliente
          </div>
        </Button>
      </header>

      <div className={"customerGrid"}>
        {customers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </main>
  );
};