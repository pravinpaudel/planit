import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

// Badge variants using cva for consistent styling with design system
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-roadmap-primary/10 text-roadmap-primary dark:bg-roadmap-primary/20',
        secondary: 'bg-roadmap-secondary/10 text-roadmap-secondary dark:bg-roadmap-secondary/20',
        accent: 'bg-roadmap-accent/10 text-roadmap-accent dark:bg-roadmap-accent/20',
        success: 'bg-roadmap-success/10 text-roadmap-success dark:bg-roadmap-success/20',
        warning: 'bg-roadmap-warning/10 text-roadmap-warning dark:bg-roadmap-warning/20',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        outline: 'border border-roadmap-primary text-roadmap-primary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Whether the badge should pulse with an animation
   */
  pulse?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, pulse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
