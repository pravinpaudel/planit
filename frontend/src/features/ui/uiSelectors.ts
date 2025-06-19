import { RootState } from '../../store';

/**
 * Selects the global application loading state
 */
export const selectIsLoading = (state: RootState): boolean => state.ui.isLoading;

/**
 * Selects all error messages
 */
export const selectErrors = (state: RootState): Record<string, string> => state.ui.errors;

/**
 * Selects an error message by key
 */
export const selectErrorByKey = (key: string) => (state: RootState): string | undefined => 
  state.ui.errors[key];

/**
 * Selects all notifications
 */
export const selectNotifications = (state: RootState) => state.ui.notifications;
