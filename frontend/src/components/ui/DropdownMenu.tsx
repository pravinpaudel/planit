import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  buttonClassName?: string;
}

export const DropdownMenu = ({ children, className, align = 'right', buttonClassName }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={cn(
          "p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none",
          buttonClassName
        )}
        aria-expanded={isOpen}
        aria-label="More options"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute z-10 mt-1 py-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            align === 'right' ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ 
  children, 
  onClick,
  className,
  icon,
  destructive = false
}: { 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
}) => {
  return (
    <button
      className={cn(
        "flex items-center w-full px-4 py-2 text-sm text-left",
        destructive 
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
