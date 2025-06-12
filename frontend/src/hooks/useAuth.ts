import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { logout } from '../features/auth/authSlice';
import { addNotification } from '../store/uiSlice';

/**
 * A custom hook to handle authentication in the app
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Check if auth token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // If we have no token but user is still in state, logout
    if (!token && !refreshToken && user) {
      dispatch(logout());
      dispatch(
        addNotification({
          type: 'error',
          message: 'Your session has expired. Please log in again.',
        })
      );
      navigate('/login');
    }
  }, [dispatch, navigate, user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

/**
 * A custom hook to protect routes
 */
export const useAuthRedirect = (redirectTo: string = '/login') => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return isAuthenticated;
};
