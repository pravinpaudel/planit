import { forwardRef, LabelHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Whether the field this label is for is required
   */
  required?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required = false, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {required && (
          <span className="sr-only">(required)</span>
        )}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';
