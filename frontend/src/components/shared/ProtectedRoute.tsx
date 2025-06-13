import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import type { AuthState } from '../../types';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const auth = useAppSelector((state) => state.auth as AuthState);
  const isAuthenticated = auth.isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = ({ redirectPath = '/dashboard' }: ProtectedRouteProps) => {
  const auth = useAppSelector((state) => state.auth as AuthState);
  const isAuthenticated = auth.isAuthenticated;

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
