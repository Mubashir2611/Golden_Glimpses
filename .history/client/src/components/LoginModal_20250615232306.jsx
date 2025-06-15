import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!credentials.email || !credentials.password) {
      setError('All fields are required');
      return;
    }

    if (isRegister && credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Pass credentials up to parent for authentication
    onLogin(credentials);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>{isRegister ? 'Create Account' : 'Login'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        
        <div className="modal-footer">
          <button 
            className="switch-mode" 
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister 
              ? 'Already have an account? Log in' 
              : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
