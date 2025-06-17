import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import LoginModal from './LoginModal';

const Navbar = ({ isLoggedIn, onLogin, onLogout }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogin = (credentials) => {
    // Pass credentials up to the parent component
    onLogin(credentials);
    // Close the modal
    setShowLoginModal(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Time Capsule</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        
        {!isLoggedIn ? (
          <button 
            className="login-btn" 
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </button>
        ) : (
          <div className="user-menu">
            <div className="user-avatar" onClick={toggleUserMenu}>
              U
            </div>
            {showUserMenu && (
              <div className="dropdown-menu">
                <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <button onClick={onLogout} className="dropdown-item">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
};

export default Navbar;