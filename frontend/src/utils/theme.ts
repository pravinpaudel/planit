/**
 * Central theme configuration for the application
 * Contains color tokens, spacing, typography and animation settings
 */

export const theme = {
  colors: {
    primary: 'hsl(var(--roadmap-primary))',
    secondary: 'hsl(var(--roadmap-secondary))',
    accent: 'hsl(var(--roadmap-accent))',
    warning: 'hsl(var(--roadmap-warning))',
    success: 'hsl(var(--roadmap-success))',
    surface: 'hsl(var(--roadmap-surface))',
    path: 'hsl(var(--roadmap-path))',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    }
  },
  spacing: {
    // Consistent spacing scale
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
  },
  animation: {
    durations: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    timingFunctions: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    }
  },
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  }
};

// Theme-related utility functions
export const getThemeValue = (path: string) => {
  return path.split('.').reduce((acc: any, part: string) => {
    return acc && acc[part] ? acc[part] : null;
  }, theme);
};

// Helper to generate CSS variables from theme
export const generateCssVariables = () => {
  const variables: Record<string, string> = {};
  
  // Process colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });
  
  return variables;
};
