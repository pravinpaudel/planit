import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { getCurrentUser } from '../services/authService';
import { setUser, logout } from '../features/auth/authSlice';
import { addNotification } from '../store/uiSlice';

/**
 * A custom hook to handle authentication in the app
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Fetch current user if token exists but user data doesn't
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const fetchCurrentUser = async () => {
      if (token && !user) {
        try {
          const response = await getCurrentUser();
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          dispatch(logout());
          dispatch(
            addNotification({
              type: 'error',
              message: 'Your session has expired. Please log in again.',
            })
          );
          navigate('/login');
        }
      }
    };

    fetchCurrentUser();
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
