import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!credentials.email || !credentials.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (isRegister && !credentials.name) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (isRegister && credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegister) {
        result = await register(credentials.name, credentials.email, credentials.password);
      } else {
        result = await login(credentials.email, credentials.password);
      }

      if (result.success) {
        // Close modal on successful authentication
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await demoLogin();
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={credentials.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
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
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Sign Up' : 'Log In')}
          </button>
            <button 
            type="button" 
            className="demo-button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              marginTop: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Logging in...' : '🚀 Try Demo Login'}
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
