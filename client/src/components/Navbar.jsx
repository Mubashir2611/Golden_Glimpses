import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconButton } from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon, SettingsBrightness as SystemModeIcon } from '@mui/icons-material';
import { useTheme } from '../hooks/useTheme';
import './Navbar.css';

const Navbar = ({ onShowAuth, isLoggedIn, onLogout, user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { themeMode, toggleTheme } = useTheme();
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
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

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Logo */}
      <Link to="/" className="navbar-brand">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Golden Glimpses
        </motion.div>
      </Link>
      
      {/* Navigation Links */}
      <div className="nav-center">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
      </div>
      
      {/* Theme Toggle and Auth Buttons */}
      <div className="nav-auth">
        <IconButton 
          onClick={toggleTheme}
          sx={{ 
            color: 'var(--text-primary)', 
            mr: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          title={`Current theme: ${themeMode}`}
        >
          {getThemeIcon()}
        </IconButton>
        {!isLoggedIn ? (
          <div className="auth-buttons">
            <motion.button 
              className="auth-btn login-btn"
              onClick={() => onShowAuth('login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Log In
            </motion.button>
            <motion.button 
              className="auth-btn register-btn"
              onClick={() => onShowAuth('register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Register
            </motion.button>
          </div>
        ) : (
          <div className="user-menu">
            <motion.div 
              className="user-avatar" 
              onClick={toggleUserMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}            </motion.div>
            {showUserMenu && (
              <motion.div 
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <button onClick={onLogout} className="dropdown-item logout-item">Logout</button>
              </motion.div>
            )}
          </div>        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;