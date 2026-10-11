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

/** Credenciais públicas do usuário de demonstração (as mesmas do backend). */
export const DEMO_CREDENTIALS = {
  email: 'demo@crmpro.dev',
  password: 'demo1234',
};
