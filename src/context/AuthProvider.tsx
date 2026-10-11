import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../services/api';
import { clearSession, getStoredUser, getToken, saveSession, SESSION_EXPIRED_EVENT } from '../services/session';
import type { User } from '../types/auth';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => (getToken() ? getStoredUser() : null));

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    saveSession(session.token, session.user);
    setUser(session.user);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      if (!getToken()) return;
      logout();
      toast.info('Sua sessão expirou. Entre novamente.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
