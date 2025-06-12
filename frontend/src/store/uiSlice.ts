import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Notification, UIState } from '../types';
import { v4 as uuidv4 } from 'uuid';

const initialState: UIState = {
  isLoading: false,
  errors: {},
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.errors[action.payload.key] = action.payload.message;
    },
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors = {};
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification = {
        ...action.payload,
        id: uuidv4(),
        duration: action.payload.duration || 5000, // Default 5 seconds
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  clearAllErrors,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
