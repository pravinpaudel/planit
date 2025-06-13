import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Whether the input has an error
   */
  hasError?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, hasError, errorMessage, id, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const errorId = errorMessage ? `${id}-error` : undefined;
    const combinedAriaDescribedBy = ariaDescribedBy 
      ? `${ariaDescribedBy} ${errorId}`.trim()
      : errorId;
    
    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-400',
            hasError
              ? 'border-red-500 pr-10 focus-visible:ring-red-500'
              : 'focus-visible:border-roadmap-primary focus-visible:ring-roadmap-primary',
            className
          )}
          id={id}
          aria-invalid={hasError}
          aria-describedby={combinedAriaDescribedBy || undefined}
          {...props}
        />
        
        {errorMessage && (
          <p 
            className="mt-2 text-sm text-red-600 dark:text-red-500" 
            id={errorId}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
