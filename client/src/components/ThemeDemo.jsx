import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useTheme } from '../hooks/useTheme';

const ThemeDemo = () => {
  const { themeMode, actualTheme, setTheme } = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dark Mode System Demo
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Theme Status
          </Typography>
          <Typography>
            Theme Mode: <strong>{themeMode}</strong>
          </Typography>
          <Typography>
            Active Theme: <strong>{actualTheme}</strong>
          </Typography>
          <Typography>
            Background: <strong>{actualTheme === 'dark' ? 'Dark' : 'Light'}</strong>
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant={themeMode === 'light' ? 'contained' : 'outlined'}
          onClick={() => setTheme('light')}
        >
          Light Theme
        </Button>
        <Button 
          variant={themeMode === 'dark' ? 'contained' : 'outlined'}
          onClick={() => setTheme('dark')}
        >
          Dark Theme
        </Button>
        <Button 
          variant={themeMode === 'system' ? 'contained' : 'outlined'}
          onClick={() => setTheme('system')}
        >
          System Theme
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Features Implemented:
          </Typography>
          <ul>
            <li>System theme detection</li>
            <li>Manual light/dark/system theme switching</li>
            <li>Persistent theme settings in localStorage</li>
            <li>CSS custom properties for consistent theming</li>
            <li>Material-UI theme integration</li>
            <li>Smooth transitions between themes</li>
            <li>Theme toggle in navigation bar</li>
            <li>Settings page theme controls</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ThemeDemo;
