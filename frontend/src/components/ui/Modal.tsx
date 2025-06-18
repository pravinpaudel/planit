import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Modal component for displaying content in a dialog.
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to call when the modal should close
 * @param title - Optional title to display in the modal header
 * @param children - Content to display in the modal body
 * @param size - Size of the modal: 'sm' (small), 'md' (medium, default), 'lg' (large), 'xl' (extra large), or 'full' (maximum width)
 * @param className - Additional CSS classes to apply to the modal container
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  className,
}) => {
  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close modal on escape key press
  useEffect(() => {
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Define size classes based on the size prop
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl w-[95%]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto",
                sizeClasses[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title || ''}
                </h3>
                {(
                  <button
                    onClick={onClose}
                    
                    className={cn(
                      "p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500",
                      "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
