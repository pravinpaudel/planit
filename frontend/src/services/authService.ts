import axios from 'axios';
import type { LoginFormData, RegisterFormData } from '../types';
import { setupInterceptors } from './interceptors';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors for handling auth token and errors
setupInterceptors(axiosInstance);

export const registerUser = async (userData: RegisterFormData) => {
  return await axiosInstance.post('/users/register', userData);
};

export const loginUser = async (credentials: LoginFormData) => {
  return await axiosInstance.post('/users/login', credentials);
};

export const refreshAuthToken = async (refreshToken: string) => {
  return await axiosInstance.post('/users/refresh-token', { refreshToken });
};

export const logoutUser = async (refreshToken: string) => {
  return await axiosInstance.post('/users/logout', { refreshToken });
};
