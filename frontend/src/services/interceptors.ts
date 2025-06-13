import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout, refreshToken } from '../features/auth/authSlice';
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

  // Keep track of whether we're refreshing the token
  let isRefreshing = false;
  // Store the requests that are waiting for token refresh
  let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    
    failedQueue = [];
  };

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const { response, config } = error;
      
      // If the error is due to an expired token
      if (response && response.status === 401 && config) {
        const originalRequest = config;
        
        // Check for token expired error (could be different based on backend response)
        const isTokenExpired = response.data && 
          (response.data as any).code === 'TOKEN_EXPIRED';
        
        if (isTokenExpired && !originalRequest.headers['X-Retry']) {
          if (!isRefreshing) {
            isRefreshing = true;
            
            try {
              // Try to refresh the token
              const action = await store.dispatch(refreshToken());
              
              if (refreshToken.fulfilled.match(action)) {
                // Update headers for the original request
                originalRequest.headers['Authorization'] = `Bearer ${action.payload.accessToken}`;
                originalRequest.headers['X-Retry'] = 'true';
                
                // Process any requests in the queue
                processQueue(null, action.payload.accessToken);
                
                // Retry the original request
                return axiosInstance(originalRequest);
              } else {
                // Token refresh failed
                processQueue(new Error('Failed to refresh token'));
                store.dispatch(logout());
                store.dispatch(
                  addNotification({
                    type: 'error',
                    title: 'Session Expired',
                    message: 'Your session has expired. Please log in again.',
                  })
                );
                return Promise.reject(error);
              }
            } catch (refreshError) {
              processQueue(refreshError);
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // If refresh is already in progress, add request to queue
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  originalRequest.headers['X-Retry'] = 'true';
                  resolve(axiosInstance(originalRequest));
                },
                reject: (err) => {
                  reject(err);
                },
              });
            });
          }
        } else if (!isTokenExpired) {
          // For other 401 errors (not token expired)
          store.dispatch(logout());
          
          // Extract error message from response with proper casting
          const errorMessage = response.data ? 
            ((response.data as any).error || 'Please log in again.') : 
            'Please log in again.';
            
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Authentication Failed',
              message: errorMessage,
            })
          );
          
          // Add debugging for error response
          console.log('Authentication error response:', response.data);
        }
      } else if (response) {
        // Handle other errors
        console.log('Error response data:', response.data);
        
        const errorMessage = response.data ? 
          ((response.data as any).error || 'An unexpected error occurred') : 
          'An unexpected error occurred';
        
        store.dispatch(
          addNotification({
            type: 'error',
            title: 'Request Error',
            message: errorMessage,
          })
        );
      } else {
        // Network errors or other issues
        store.dispatch(
          addNotification({
            type: 'error',
            title: 'Network Error',
            message: 'Network error. Please check your connection.',
          })
        );
      }
      
      return Promise.reject(error);
    }
  );
};
