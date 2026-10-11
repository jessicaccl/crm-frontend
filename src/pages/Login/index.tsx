import { useEffect, useId, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Kanban, LoaderCircle, LogIn, Plug, TrendingUp } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/auth-context';
import { getErrorMessage, getProblem } from '../../services/api';
import { DEMO_CREDENTIALS } from '../../types/auth';
import './styles.css';

// No plano gratuito do Render a API "dorme"; o primeiro acesso pode levar até ~1 minuto
const SLOW_SERVER_MS = 4000;

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/funil';

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsSlow(true), SLOW_SERVER_MS);
    return () => {
      clearTimeout(timer);
      setIsSlow(false);
    };
  }, [isLoading]);

  if (user) return <Navigate to={redirectTo} replace />;

  const submit = async (credentials: { email: string; password: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getProblem(err)?.status === 401 ? 'E-mail ou senha incorretos.' : getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    submit({ email, password });
  };

  const enterAsDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    submit(DEMO_CREDENTIALS);
  };

  return (
    <div className="loginPage">
      <aside className="loginBrand">
        <div className="loginLogo">
          <img src="/favicon.svg" alt="" width={32} height={32} />
          CRM Pro
        </div>
        <div className="loginPitch">
          <h1>Acompanhe cada venda do primeiro contato ao fechamento.</h1>
          <ul>
            <li>
              <Kanban size={18} /> Funil Kanban: arraste negócios entre as etapas
            </li>
            <li>
              <TrendingUp size={18} /> Indicadores de conversão e receita do mês
            </li>
            <li>
              <Plug size={18} /> API aberta e documentada para integrar outras plataformas
            </li>
          </ul>
        </div>
        <p className="loginCredits">Projeto piloto · Java, Spring Boot, PostgreSQL e React</p>
      </aside>

      <main className="loginMain">
        <div className="loginCard">
          <h2>Entrar</h2>
          <p className="loginHint">Use sua conta ou explore com o usuário de demonstração.</p>

          <form id={formId} className="loginForm" onSubmit={onSubmit} noValidate>
            <label htmlFor={`${formId}-email`}>E-mail</label>
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com.br"
            />
            <label htmlFor={`${formId}-password`}>Senha</label>
            <input
              id={`${formId}-password`}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <p className="loginError" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="loginSubmit">
              {isLoading ? <LoaderCircle size={18} className="spin" /> : <LogIn size={18} />}
              Entrar
            </Button>
          </form>

          {isSlow && (
            <p className="loginSlow" role="status">
              Acordando o servidor… no plano gratuito o primeiro acesso pode levar até 1 minuto.
            </p>
          )}

          <div className="demoBox">
            <div>
              <strong>Acesso de demonstração</strong>
              <span>
                {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
              </span>
            </div>
            <Button variant="secondary" onClick={enterAsDemo} disabled={isLoading}>
              Entrar como demo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
