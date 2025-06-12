import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and then merges Tailwind CSS classes.
 * This utility helps resolve conflicts when similar Tailwind classes are combined.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
