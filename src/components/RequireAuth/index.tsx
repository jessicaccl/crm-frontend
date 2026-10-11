import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/auth-context';

/** Manda para o login quem não está logado, lembrando a página que tentou abrir. */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};
