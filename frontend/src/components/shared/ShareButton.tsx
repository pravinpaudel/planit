import { FC } from 'react';
import { Share, Globe } from 'lucide-react';
import { Button, ButtonProps } from '../ui/Button';

interface ShareButtonProps extends Omit<ButtonProps, 'children'> {
  isPublic?: boolean;
  onClick: () => void;
  label?: string;
}

/**
 * Reusable share button component that shows appropriate icon based on sharing status
 */
export const ShareButton: FC<ShareButtonProps> = ({ 
  isPublic = false, 
  onClick,
  label,
  ...buttonProps 
}) => {
  return (
    <Button
      onClick={onClick}
      {...buttonProps}
    >
      {isPublic ? (
        <>
          <Globe size={16} className="mr-2 text-green-600" />
          {label || 'Manage Sharing'}
        </>
      ) : (
        <>
          <Share size={16} className="mr-2" />
          {label || 'Share'}
        </>
      )}
    </Button>
  );
};
