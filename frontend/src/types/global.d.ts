import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// For libraries that don't have type definitions
declare module 'framer-motion' {
  export interface AnimationProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    layout?: boolean | string;
    layoutId?: string;
    onAnimationComplete?: () => void;
    onAnimationStart?: () => void;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
  }

  export const motion: {
    [key: string]: React.ForwardRefExoticComponent<
      any & React.RefAttributes<any> & AnimationProps
    >;
  };
  
  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
  
  export const LayoutGroup: React.FC<{
    children?: React.ReactNode;
    id?: string;
  }>;
}

// Declare missing Lucide icons
declare module 'lucide-react' {
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    stroke?: string | number;
  }
  
  export const Share: React.FC<IconProps>;
  export const Globe: React.FC<IconProps>;
  export const Link: React.FC<IconProps>;
  export const Copy: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const Lock: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const EyeOff: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const LockOpen: React.FC<IconProps>;
}

export {};
