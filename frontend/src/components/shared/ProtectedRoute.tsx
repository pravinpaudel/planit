import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { usePendingClone } from '../../hooks/usePendingClone';
import { useEffect } from 'react';
import type { AuthState } from '../../types';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const auth = useAppSelector((state) => state.auth as AuthState);
  const isAuthenticated = auth.isAuthenticated;
  const { processPendingClone } = usePendingClone();

  // Check for pending clone when user is authenticated
  useEffect(() => {
    // Only check for pending clones when authenticated
    if (isAuthenticated) {
      const pendingClone = localStorage.getItem('pendingCloneRoadmap');
      if (pendingClone) {
        processPendingClone();
      }
    }
  }, [isAuthenticated, processPendingClone]);

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
