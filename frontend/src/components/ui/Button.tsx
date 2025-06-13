import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

// Button variants using cva for consistent styling with design system
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 ease-bounce-soft focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-roadmap-primary text-white hover:bg-roadmap-primary/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-primary/70',
        secondary: 'bg-roadmap-secondary text-white hover:bg-roadmap-secondary/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-secondary/70',
        accent: 'bg-roadmap-accent text-white hover:bg-roadmap-accent/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-accent/70',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 hover:border-roadmap-primary hover:shadow-sm focus:ring-roadmap-primary/50',
        ghost: 'bg-transparent hover:bg-roadmap-primary/10 hover:text-roadmap-primary focus:ring-roadmap-primary/50',
        destructive: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5 focus:ring-red-500',
        success: 'bg-roadmap-success text-white hover:bg-roadmap-success/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-success/70',
        warning: 'bg-roadmap-warning text-white hover:bg-roadmap-warning/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-warning/70',
        'gradient-primary': 'bg-gradient-to-r from-roadmap-primary to-roadmap-secondary text-white hover:from-roadmap-primary/90 hover:to-roadmap-secondary/90 hover:shadow-md hover:-translate-y-0.5 focus:ring-roadmap-primary/70',
      },
      size: {
        xs: 'h-8 px-2.5 py-0.5 text-xs',
        sm: 'h-9 px-3 py-1 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 py-2 text-base',
        xl: 'h-12 px-8 py-2.5 text-lg',
        icon: 'h-10 w-10 p-2',
      },
      fullWidth: {
        true: 'w-full',
      },
      rounded: {
        true: 'rounded-full',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
      rounded: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant, 
    size, 
    rounded,
    fullWidth, 
    isLoading, 
    disabled,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {rightIcon && !isLoading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
