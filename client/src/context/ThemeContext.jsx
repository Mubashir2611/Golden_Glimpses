import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeContext } from '../contexts/themeContext.js';

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const createAppTheme = (mode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#6366F1',
        light: '#818CF8',
        dark: '#4F46E5',
      },
      secondary: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      background: {
        default: isDark ? '#0F0F0F' : '#FAFAFA',
        paper: isDark ? '#1A1A1A' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#1F2937',
        secondary: isDark ? '#D1D5DB' : '#6B7280',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || 'system';
  });

  const [actualTheme, setActualTheme] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'system' || !savedTheme) {
      return getSystemTheme();
    }
    return savedTheme;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (themeMode === 'system') {
        setActualTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update actual theme when theme mode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setActualTheme(getSystemTheme());
    } else {
      setActualTheme(themeMode);
    }
  }, [themeMode]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Update CSS custom properties for compatibility with non-MUI components
  useEffect(() => {
    const root = document.documentElement;
    
    if (actualTheme === 'dark') {
      root.style.setProperty('--background-color', '#0F0F0F');
      root.style.setProperty('--surface-color', '#1A1A1A');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#D1D5DB');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
    } else {
      root.style.setProperty('--background-color', '#FAFAFA');
      root.style.setProperty('--surface-color', '#FFFFFF');
      root.style.setProperty('--text-primary', '#1F2937');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.12)');
    }

    // Update body background
    document.body.style.backgroundColor = actualTheme === 'dark' ? '#0F0F0F' : '#FAFAFA';
    document.body.style.color = actualTheme === 'dark' ? '#FFFFFF' : '#1F2937';
  }, [actualTheme]);

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setTheme('dark');
    } else if (themeMode === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const muiTheme = createAppTheme(actualTheme);

  const value = {
    themeMode,
    actualTheme,
    setTheme,
    toggleTheme,
    isDark: actualTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
