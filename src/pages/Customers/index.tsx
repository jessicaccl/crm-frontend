import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, SearchX, TriangleAlert, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { CustomerCard } from '../../components/CustomerCard';
import { CustomerFormModal } from '../../components/CustomerFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getErrorMessage } from '../../services/api';
import type { Customer, CustomerStatus } from '../../types/customer';
import './styles.css';

const PAGE_SIZE = 12;

const filterOptions: { value?: CustomerStatus; label: string }[] = [
  { label: 'Todos' },
  { value: 'LEAD', label: 'Leads' },
  { value: 'CUSTOMER', label: 'Clientes' },
  { value: 'INACTIVE', label: 'Inativos' },
];

type FormTarget = { customer?: Customer } | null;

export const Customers = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus>();
  const [page, setPage] = useState(0);
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [toDelete, setToDelete] = useState<Customer | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const { data, isPending, isError, error, refetch, isFetching } = useCustomers({
    q: debouncedSearch || undefined,
    status,
    page,
    size: PAGE_SIZE,
  });
  const deleteCustomer = useDeleteCustomer();

  const hasFilters = Boolean(debouncedSearch || status);
  const total = data?.page.totalElements ?? 0;
  const totalPages = data?.page.totalPages ?? 0;

  const clearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setPage(0);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteCustomer.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`${toDelete.name} foi excluído`);
        // Se era o último item da página, volta uma página
        if (data?.content.length === 1 && page > 0) setPage(page - 1);
        setToDelete(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Clientes</h1>
          <p className="pageSubtitle">
            {data && !hasFilters
              ? `${total} ${total === 1 ? 'contato cadastrado' : 'contatos cadastrados'}`
              : 'Gerencie seus leads e clientes.'}
          </p>
        </div>
        <Button onClick={() => setFormTarget({})}>
          <Plus size={18} />
          Novo cliente
        </Button>
      </header>

      <div className="toolbar">
        <label className="searchBox">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar clientes</span>
          <input
            id="customer-search"
            type="search"
            placeholder="Buscar por nome, e-mail ou empresa…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </label>

        <div className="segmented" role="group" aria-label="Filtrar por status">
          {filterOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={status === option.value}
              className={status === option.value ? 'active' : ''}
              onClick={() => {
                setStatus(option.value);
                setPage(0);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className="customerGrid" aria-busy="true" aria-label="Carregando clientes">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeletonCard" />
          ))}
        </div>
      ) : isError ? (
        <div className="stateBox stateBox--error" role="alert">
          <TriangleAlert size={28} />
          <h2>Não foi possível carregar os clientes</h2>
          <p>{getErrorMessage(error)}</p>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            Tentar novamente
          </Button>
        </div>
      ) : data.content.length === 0 ? (
        hasFilters ? (
          <div className="stateBox">
            <SearchX size={28} />
            <h2>Nenhum resultado</h2>
            <p>Nenhum contato corresponde à busca ou ao filtro escolhido.</p>
            <Button variant="secondary" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="stateBox">
            <UserPlus size={28} />
            <h2>Nenhum cliente ainda</h2>
            <p>Cadastre o primeiro contato para começar a acompanhar suas vendas.</p>
            <Button onClick={() => setFormTarget({})}>
              <Plus size={18} />
              Cadastrar primeiro cliente
            </Button>
          </div>
        )
      ) : (
        <>
          <div className={`customerGrid ${isFetching ? 'isRefreshing' : ''}`}>
            {data.content.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={(selected) => setFormTarget({ customer: selected })}
                onDelete={setToDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Paginação">
              <Button variant="secondary" onClick={() => setPage(page - 1)} disabled={page === 0}>
                <ChevronLeft size={16} />
                Anterior
              </Button>
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <Button variant="secondary" onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages}>
                Próxima
                <ChevronRight size={16} />
              </Button>
            </nav>
          )}
        </>
      )}

      {formTarget && <CustomerFormModal customer={formTarget.customer} onClose={() => setFormTarget(null)} />}

      {toDelete && (
        <ConfirmDialog
          title="Excluir cliente?"
          confirmLabel="Excluir"
          isLoading={deleteCustomer.isPending}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        >
          <strong style={{ color: 'var(--text-main)' }}>{toDelete.name}</strong> será removido permanentemente. Essa
          ação não pode ser desfeita.
        </ConfirmDialog>
      )}
    </main>
  );
};
