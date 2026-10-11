import type { User } from '../types/auth';

const TOKEN_KEY = 'crm.token';
const USER_KEY = 'crm.user';

/** Evento disparado quando a API responde 401 (token expirado ou inválido). */
export const SESSION_EXPIRED_EVENT = 'crm:session-expired';

// localStorage pode falhar (aba anônima, armazenamento bloqueado): nesse caso a sessão vale só até recarregar
let memoryToken: string | null = null;
let memoryUser: User | null = null;

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : memoryUser;
  } catch {
    return memoryUser;
  }
}

export function saveSession(token: string, user: User) {
  memoryToken = token;
  memoryUser = user;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // segue com a sessão em memória
  }
}

export function clearSession() {
  memoryToken = null;
  memoryUser = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // nada a limpar
  }
}
