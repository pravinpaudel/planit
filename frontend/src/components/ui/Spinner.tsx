import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <Loader2
        className={cn(`animate-spin ${sizeMap[size]} text-blue-600`, className)}
      />
    </div>
  );
};

export const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
    <Spinner size="lg" />
  </div>
);
