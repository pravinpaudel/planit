import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';
import { addNotification } from '../store/uiSlice';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Add token to request headers if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      const { response } = error;
      
      if (response && response.status === 401) {
        // Unauthorized - clear user data and redirect to login
        store.dispatch(logout());
        store.dispatch(
          addNotification({
            type: 'error',
            message: 'Your session has expired. Please log in again.',
          })
        );
      } else if (response) {
        // Handle other errors
        const errorMessage = 
          (response.data as any)?.message || 'An unexpected error occurred';
        
        store.dispatch(
          addNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      } else {
        // Network errors or other issues
        store.dispatch(
          addNotification({
            type: 'error',
            message: 'Network error. Please check your connection.',
          })
        );
      }
      
      return Promise.reject(error);
    }
  );
};
