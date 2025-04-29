import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
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
  // Add other properties as needed
});

function ThemeProviderWrapper({ children }) {
  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
}

export default ThemeProviderWrapper;