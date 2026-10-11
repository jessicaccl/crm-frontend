import { ExternalLink, LogOut } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/auth-context';
import '../Customers/styles.css';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';
const DOCS_URL = API_URL.replace(/\/api\/v1\/?$/, '') + '/docs';

const roleLabels = { ADMIN: 'Administradora', DEMO: 'Demonstração' } as const;

export const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <main className="container">
      <header className="pageHeader">
        <div>
          <h1>Configurações</h1>
          <p className="pageSubtitle">Sua conta e informações do projeto.</p>
        </div>
      </header>

      <section className="settingsCard">
        <h2>Conta</h2>
        <dl className="settingsList">
          <div>
            <dt>Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{user ? roleLabels[user.role] : ''}</dd>
          </div>
        </dl>
        {user?.role === 'DEMO' && (
          <p className="settingsNote">
            Você está na conta de demonstração. Os dados de exemplo são restaurados todos os dias, então fique à vontade
            para criar, mover e excluir.
          </p>
        )}
        <Button variant="secondary" onClick={logout}>
          <LogOut size={16} />
          Sair
        </Button>
      </section>

      <section className="settingsCard">
        <h2>Sobre o projeto</h2>
        <p className="settingsNote">
          CRM de vendas construído como projeto piloto: API REST em Java com Spring Boot e PostgreSQL, interface em React
          com TypeScript.
        </p>
        <ul className="settingsLinks">
          <li>
            <a href={DOCS_URL} target="_blank" rel="noreferrer">
              Documentação da API (Swagger) <ExternalLink size={14} />
            </a>
          </li>
          <li>
            <a href="https://github.com/jessicaccl/crm-vendas-backend" target="_blank" rel="noreferrer">
              Código do backend <ExternalLink size={14} />
            </a>
          </li>
          <li>
            <a href="https://github.com/jessicaccl/crm-frontend" target="_blank" rel="noreferrer">
              Código do frontend <ExternalLink size={14} />
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
};
