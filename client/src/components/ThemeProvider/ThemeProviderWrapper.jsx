import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import customTheme from '../../utils/theme';  // Updated path with one more level up

// Convert your structured theme to MUI format
const muiTheme = createTheme({
  palette: {
    primary: customTheme.colors.primary,
    secondary: customTheme.colors.secondary,
    error: customTheme.colors.error,
    warning: customTheme.colors.warning,
    info: customTheme.colors.info,
    success: customTheme.colors.success,
    text: customTheme.colors.text,
    background: customTheme.colors.background,
  },
  typography: customTheme.typography,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: '50px'
        }
      }
    }
  },
  shape: {
    borderRadius: 10
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.05)',
    '0 4px 8px rgba(0, 0, 0, 0.08)',
    '0 6px 12px rgba(0, 0, 0, 0.08)',
    '0 8px 16px rgba(0, 0, 0, 0.08)',
    '0 10px 20px rgba(0, 0, 0, 0.08)',
    '0 12px 24px rgba(0, 0, 0, 0.1)',
    // Add more shadows up to index 24
    '0 14px 28px rgba(0, 0, 0, 0.12)',
    '0 16px 32px rgba(0, 0, 0, 0.12)',
    '0 18px 36px rgba(0, 0, 0, 0.12)',
    '0 20px 40px rgba(0, 0, 0, 0.12)',
    '0 22px 44px rgba(0, 0, 0, 0.14)',
    '0 24px 48px rgba(0, 0, 0, 0.14)',
    '0 26px 52px rgba(0, 0, 0, 0.14)',
    '0 28px 56px rgba(0, 0, 0, 0.14)',
    '0 30px 60px rgba(0, 0, 0, 0.16)',
    '0 32px 64px rgba(0, 0, 0, 0.16)',
    '0 34px 68px rgba(0, 0, 0, 0.16)',
    '0 36px 72px rgba(0, 0, 0, 0.16)',
    '0 38px 76px rgba(0, 0, 0, 0.18)',
    '0 40px 80px rgba(0, 0, 0, 0.18)',
    '0 42px 84px rgba(0, 0, 0, 0.18)',
    '0 44px 88px rgba(0, 0, 0, 0.18)',
    '0 46px 92px rgba(0, 0, 0, 0.20)',
    '0 48px 96px rgba(0, 0, 0, 0.20)'
    // ...rest of shadows
  ],
});

function ThemeProviderWrapper({ children }) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default ThemeProviderWrapper;