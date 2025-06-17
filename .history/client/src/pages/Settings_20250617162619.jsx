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
  Close as CloseIcon
} from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
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
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newCapsuleReminders: true,
    capsuleUnlockAlerts: true,
    autoplayMedia: true,
    darkMode: true,
    theme: 'dark',
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
        // Call the API to delete the account
        await api.delete('/users/account');
        
        // Log out the user
        logout();
        
        // Redirect to home page
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
          
          {/* Notifications Tab */}
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
                <ListItem>
                  <ListItemText 
                    primary="Dark Mode" 
                    secondary="Use dark theme for the application" 
                  />
                  <ListItemSecondaryAction>
                    <Switch 
                      checked={settings.darkMode}
                      onChange={handleSettingChange('darkMode')}
                      edge="end"
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="theme-label">Theme</InputLabel>
                  <Select
                    labelId="theme-label"
                    id="theme-select"
                    value={settings.theme}
                    label="Theme"
                    onChange={handleSettingChange('theme')}
                  >
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    id="language-select"
                    value={settings.language}
                    label="Language"
                    onChange={handleSettingChange('language')}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ben">Bengali</MenuItem>
                    <MenuItem value="hind">Hindi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
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
          
          {/* Privacy & Security Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                  Account Security
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  Change Password
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ mb: 2, ml: 2 }}
                >
                  Enable Two-Factor Authentication
                </Button>
              </Grid>
              
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
