import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Custom hook for typed useDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Custom hook for typed useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
