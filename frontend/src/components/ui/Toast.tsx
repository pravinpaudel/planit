import { forwardRef, useState, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the toast
   */
  title?: string;
  /**
   * The message content of the toast
   */
  message: string;
  /**
   * The variant of the toast
   */
  variant?: ToastVariant;
  /**
   * Whether to show the close button
   */
  showClose?: boolean;
  /**
   * Duration in ms to show the toast, 0 means it won't auto-close
   */
  duration?: number;
  /**
   * Callback when the toast is closed
   */
  onClose?: () => void;
}

const toastVariantStyles = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

const toastIcons = {
  default: null,
  success: <CheckCircle className="h-5 w-5 text-roadmap-success" />,
  error: <X className="h-5 w-5 text-red-600" />,
  warning: <Loader2 className="h-5 w-5 text-roadmap-warning" />,
  info: <CheckCircle className="h-5 w-5 text-roadmap-secondary" />,
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    title, 
    message,
    variant = 'default', 
    showClose = true, 
    duration = 5000,
    onClose,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      let timer: number | undefined;
      if (duration > 0) {
        timer = window.setTimeout(() => {
          setIsVisible(false);
        }, duration);
      }
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [duration]);

    const handleClose = () => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Delay to allow animation to complete
      }
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            className={cn(
              'relative flex w-[350px] items-start gap-3 rounded-lg border p-4 shadow-md',
              toastVariantStyles[variant],
              className
            )}
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            {...props}
          >
            {toastIcons[variant] && (
              <div className="flex-shrink-0 mt-0.5">
                {toastIcons[variant]}
              </div>
            )}
            
            <div className="flex-1 mr-2">
              {title && (
                <h5 className="mb-1 font-medium text-gray-900 dark:text-white">
                  {title}
                </h5>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            </div>
            
            {showClose && (
              <button 
                onClick={handleClose}
                aria-label="Close notification"
                className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-roadmap-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Toast.displayName = 'Toast';

export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

export const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ className, position = 'top-right', ...props }, ref) => {
    const positionClasses = {
      'top-right': 'fixed top-4 right-4 z-50 flex flex-col gap-2 items-end',
      'top-left': 'fixed top-4 left-4 z-50 flex flex-col gap-2 items-start',
      'bottom-right': 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end',
      'bottom-left': 'fixed bottom-4 left-4 z-50 flex flex-col gap-2 items-start',
      'top': 'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center',
      'bottom': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center',
    };

    return (
      <div 
        ref={ref}
        className={cn(positionClasses[position], className)}
        {...props}
      />
    );
  }
);

ToastContainer.displayName = 'ToastContainer';
