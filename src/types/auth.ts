export interface Organization {
  id: number;
  name: string;
  slug: string;
  demo: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DEMO';
  /** Pode faltar em sessões salvas antes do multiempresa. */
  organization?: Organization;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

/** Ambiente de demonstração? Com VITE_DEMO_MODE=false o acesso demo some da tela de login. */
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

/** Credenciais públicas do usuário de demonstração (as mesmas do backend). */
export const DEMO_CREDENTIALS = {
  email: 'demo@crmpro.dev',
  password: 'demo1234',
};
