import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export interface MilestoneCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the card is currently being dragged
   */
  isDragging?: boolean;
  /**
   * Whether the card represents a completed milestone
   */
  isCompleted?: boolean;
  /**
   * Priority level of the milestone (1-3)
   */
  priority?: 1 | 2 | 3;
  /**
   * Whether to disable hover effects
   */
  disableHover?: boolean;
}

export const MilestoneCard = forwardRef<HTMLDivElement, MilestoneCardProps>(
  ({ 
    className, 
    children, 
    isDragging = false, 
    isCompleted = false,
    priority = 1,
    disableHover = false,
    ...props 
  }, ref) => {
    // Priority-based colors
    const priorityClasses = {
      1: 'border-l-4 border-l-roadmap-secondary',
      2: 'border-l-4 border-l-roadmap-warning',
      3: 'border-l-4 border-l-roadmap-primary',
    };

    const statusClasses = isCompleted 
      ? 'bg-gradient-to-br from-roadmap-success/10 to-roadmap-success/5 dark:from-roadmap-success/20 dark:to-roadmap-success/10'
      : '';
    
    const hoverClasses = disableHover
      ? ''
      : 'transition-all duration-300 ease-bounce-soft hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg';

    const dragClasses = isDragging
      ? 'ring-2 ring-roadmap-secondary shadow-xl rotate-1 scale-105 opacity-90'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'milestone-card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20',
          priorityClasses[priority as 1 | 2 | 3],
          statusClasses,
          hoverClasses,
          dragClasses,
          className
        )}
        role="article"
        aria-label={`Priority ${priority} ${isCompleted ? 'completed' : ''} milestone`}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MilestoneCard.displayName = 'MilestoneCard';

// Animated version with Framer Motion
export const AnimatedMilestoneCard = forwardRef<HTMLDivElement, MilestoneCardProps>(
  (props, ref) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
      layout
    >
      <MilestoneCard ref={ref} {...props} disableHover />
    </motion.div>
  )
);

AnimatedMilestoneCard.displayName = 'AnimatedMilestoneCard';
