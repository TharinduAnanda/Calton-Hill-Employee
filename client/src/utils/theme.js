// Theme configuration for your application
// This file contains color schemes, typography, spacing, and other theme values

const theme = {
  // Color palette
  colors: {
    primary: {
      main: '#2563eb', // Vibrant blue
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed', // Purple
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Modern green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Modern red
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Modern amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6', // Light blue
      light: '#93c5fd',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    text: {
      primary: '#1f2937', // Darker, more readable text
      secondary: '#4b5563',
      disabled: '#9ca3af',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      light: '#f9fafb',
      subtle: '#f3f4f6', // Light gray background for sections
      card: '#ffffff',
      dark: '#111827', // For dark mode or dark sections
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },

  // Typography settings - more modern with variable font weight
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600, // Less heavy bold for modern look
    fontWeightExtraBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none', // More modern to not use all caps for buttons
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },

  // Spacing - more consistent but slightly larger for better breathing room
  spacing: (factor) => `${0.6 * factor}rem`,

  // Breakpoints - keeping same breakpoints
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },

  // Shadows - more subtle for modern look
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
  ],

  // Border radius - more rounded for modern look
  shape: {
    borderRadius: 8,
    borderRadiusSmall: 6,
    borderRadiusLarge: 12,
    borderRadiusFull: '9999px',
  },

  // Transitions - enhanced for smoother feel
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },

  // Z-index values
  zIndex: {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  
  // Additional modern UI elements
  components: {
    card: {
      elevation: 0,
      border: `1px solid rgba(0, 0, 0, 0.05)`,
      hoverEffect: 'transform: translateY(-4px); box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transitionDuration: '0.3s',
    },
    button: {
      borderRadius: 8,
      fontWeight: 500,
      boxShadow: 'none',
      hoverEffect: 'transform: translateY(-1px)',
    },
  }
};

export default theme;

// Helper functions
export const getColor = (color, variant = 'main') => {
  return theme.colors[color]?.[variant] || theme.colors.primary.main;
};

export const getSpacing = (value) => {
  return theme.spacing(value);
};

export const getBreakpoint = (size) => {
  return `${theme.breakpoints[size]}px`;
};

export const getMediaQuery = (size) => {
  return `@media (min-width: ${getBreakpoint(size)})`;
};

// New helper functions for modern styling
export const getElevation = (level = 1) => {
  return theme.shadows[level] || theme.shadows[1];
};

export const getBorderRadius = (size = 'default') => {
  const radiusMap = {
    small: theme.shape.borderRadiusSmall,
    default: theme.shape.borderRadius,
    large: theme.shape.borderRadiusLarge,
    full: theme.shape.borderRadiusFull
  };
  return radiusMap[size] || radiusMap.default;
};