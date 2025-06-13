import type { LoginFormData, RegisterFormData } from '../types';
import axiosInstance from './axiosInstance';

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
