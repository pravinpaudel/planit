import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

// Card variants using cva for styling options
const cardVariants = cva(
  'rounded-lg border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950',
        glass: 'backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-md',
        elevated: 'border-gray-100 bg-white shadow-md dark:border-gray-800 dark:bg-gray-950',
        outlined: 'border-gray-200 bg-transparent dark:border-gray-700',
      },
      hover: {
        true: 'hover:shadow-md hover:-translate-y-1 hover:border-roadmap-primary/20',
      },
      clickable: {
        true: 'cursor-pointer active:scale-[0.98]',
      }
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      clickable: false,
    }
  }
);

export interface CardProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, clickable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, hover, clickable }),
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Glass Card is a specialized card with glassmorphism effect
const GlassCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  ({ className, hover = true, clickable, ...props }, ref) => (
    <Card
      ref={ref}
      variant="glass"
      hover={hover}
      clickable={clickable}
      className={className}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  GlassCard,
  cardVariants
};
