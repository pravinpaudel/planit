/// <reference types="vite/client" />

// This allows TypeScript to understand .tsx files as React components
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// For framer-motion types
declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export const LayoutGroup: any;
  // Add other exports as needed
}

// For lucide-react types
declare module 'lucide-react' {
  export const Plus: any;
  export const X: any;
  export const Menu: any;
  export const LogOut: any;
  export const User: any;
  export const LayoutDashboard: any;
  export const Calendar: any;
  export const CheckCircle: any;
  export const Clock: any;
  export const Target: any;
  export const Check: any;
  export const Edit2: any;
  export const Trash: any;
  export const ChevronDown: any;
  export const ChevronRight: any;
  export const ArrowLeft: any;
  export const Edit: any;
  export const MoreVertical: any;
  export const Loader2: any;
  export const ShieldAlert: any;
  export const Fullscreen: any;
  // Add other icon exports as needed
}

// Declare modules that don't have types
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}
