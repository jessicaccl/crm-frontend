export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DEMO';
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

/** Ambiente de demonstração? No CRM real (VITE_DEMO_MODE=false) o acesso demo some da tela. */
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

/** Credenciais públicas do usuário de demonstração (as mesmas do backend). */
export const DEMO_CREDENTIALS = {
  email: 'demo@crmpro.dev',
  password: 'demo1234',
};
