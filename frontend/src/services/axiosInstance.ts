import axios from 'axios';
import { setupInterceptors } from './interceptors';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors for handling auth token and errors
setupInterceptors(axiosInstance);

export default axiosInstance;