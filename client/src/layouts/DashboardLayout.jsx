import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  AddCircleOutline as AddIcon,
  Explore as ExploreIcon, 
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: theme.zIndex.drawer + 1,
}));

const DashboardLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Create New Capsule', icon: <AddIcon />, path: '/create-capsule' },
    { text: 'Memories', icon: <ExploreIcon />, path: '/explore' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 600) {
      setDrawerOpen(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Golden Glimpses
          </Typography>
          
          {/* User menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <Avatar sx={{ bgcolor: '#8B5CF6' }}>
              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={userMenuAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(30, 30, 30, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mt: 1.5,
              }
            }}
          >
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <AccountIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <Typography variant="body2">My Profile</Typography>
            </MenuItem>
            
            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>
      
      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
            pt: 8, // To account for AppBar height
          },
        }}
      >
        <List sx={{ px: 2, mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigate(item.path)}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          paddingTop: '64px',  // Height of AppBar
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
