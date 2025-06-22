import { FC } from 'react';
import { Globe, Lock } from 'lucide-react';

interface ShareStatusIconProps {
  isPublic: boolean;
  size?: number;
  className?: string; // For custom styling
}

/**
 * Component to display a sharing status icon (public or private)
 */
export const ShareStatusIcon: FC<ShareStatusIconProps> = ({ 
  isPublic, 
  size = 16,
  className = ''
}) => {
  if (isPublic) {
    return <Globe size={size} className={`text-green-600 ${className}`} />;
  }
  
  return <Lock size={size} className={`text-gray-500 ${className}`} />;
};
