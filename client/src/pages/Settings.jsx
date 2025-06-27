import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Card, 
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  BrushOutlined as ThemeIcon,
  DeleteForever as DeleteIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemModeIcon
} from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Import the API utility

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const { themeMode, setTheme, actualTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newCapsuleReminders: true,
    capsuleUnlockAlerts: true,
    autoplayMedia: true,
    language: 'en'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSettingChange = (setting) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({
      ...settings,
      [setting]: value
    });
    
    setSnackbar({
      open: true,
      message: 'Setting updated',
      severity: 'success'
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setSnackbar({
      open: true,
      message: `Theme changed to ${newTheme}`,
      severity: 'success'
    });
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light':
        return <LightModeIcon />;
      case 'dark':
        return <DarkModeIcon />;
      case 'system':
        return <SystemModeIcon />;
      default:
        return <SystemModeIcon />;
    }
  };

  const getThemeDescription = (theme) => {
    switch (theme) {
      case 'light':
        return 'Always use light theme';
      case 'dark':
        return 'Always use dark theme';
      case 'system':
        return 'Follow system settings';
      default:
        return 'Follow system settings';
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/account');
        
        logout();
        
        navigate('/');
      } catch (err) {
        console.error('Error deleting account:', err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to delete account. Please try again.',
          severity: 'error'
        });
      }
    }
  };
  
  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Settings
          </Typography>
        </Box>
        
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 3
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6366F1',
                },
                '& .MuiTab-root.Mui-selected': {
                  color: '#6366F1',
                }
              }}
            >
              <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
              <Tab icon={<ThemeIcon />} label="Appearance" iconPosition="start" />
              <Tab icon={<SecurityIcon />} label="Privacy & Security" iconPosition="start" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive emails about your capsules and account" 
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('emailNotifications')}
                    edge="end"
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <ListItem>
                <ListItemText 
                  primary="New Capsule Reminders" 
                  secondary="Get reminders to add memories to your capsules" 
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.newCapsuleReminders}
                    onChange={handleSettingChange('newCapsuleReminders')}
                    edge="end"
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <ListItem>
                <ListItemText 
                  primary="Capsule Unlock Alerts" 
                  secondary="Be notified when your time capsules become available" 
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.capsuleUnlockAlerts}
                    onChange={handleSettingChange('capsuleUnlockAlerts')}
                    edge="end"
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Theme Settings
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Current theme: {themeMode} ({actualTheme} mode active)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['light', 'dark', 'system'].map((theme) => (
                      <Button
                        key={theme}
                        variant={themeMode === theme ? 'contained' : 'outlined'}
                        startIcon={getThemeIcon(theme)}
                        onClick={() => handleThemeChange(theme)}
                        sx={{
                          minWidth: 140,
                          height: 56,
                          flexDirection: 'column',
                          gap: 0.5,
                          '& .MuiButton-startIcon': {
                            margin: 0
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                          {theme}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                          {getThemeDescription(theme)}
                        </Typography>
                      </Button>
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              </Grid>
              
              <Grid item xs={12}>
                <ListItem>
                  <ListItemText 
                    primary="Autoplay Media" 
                    secondary="Automatically play videos and audio when viewing capsules" 
                  />
                  <ListItemSecondaryAction>
                    <Switch 
                      checked={settings.autoplayMedia}
                      onChange={handleSettingChange('autoplayMedia')}
                      edge="end"
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', my: 2 }}>
                  Sessions
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="secondary"
                  sx={{ mb: 2 }}
                  onClick={handleLogout}
                >
                  Log Out of Current Session
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  sx={{ mb: 2, ml: 2 }}
                >
                  Log Out of All Devices
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', my: 2, color: 'error.main' }}>
                  Danger Zone
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Settings;
