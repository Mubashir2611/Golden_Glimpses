import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios'; // Remove local axios
import api, { authAPI } from '../utils/api'; // Import shared api instance and specific API calls

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    // Check if the user is logged in
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Get user profile with the token
        const response = await api.get('/auth/me');
        const { user } = response.data;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Token verification failed:', err);
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
    
    // Setup an interval to check token validity periodically
    const checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) verifyToken();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => {
      clearInterval(checkTokenInterval);
    };
  }, []);
  const login = async (email, password) => {
    try {
      setError(null);
      // Use the authAPI from utils/api.js
      const response = await authAPI.login(email, password); // Assuming authAPI is set up
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken); // Store refresh token
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Login failed. Please check your credentials.' 
      };
    }
  };
  const register = async (name, email, password) => {
    try {
      setError(null);
      // Use the authAPI from utils/api.js
      const response = await authAPI.register(name, email, password); // Assuming authAPI is set up
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken); // Store refresh token
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.msg || 'Registration failed. Please try again.');
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Registration failed. Please try again.' 
      };
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); // Remove refresh token on logout
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Optionally, notify other tabs/windows or redirect
    // window.location.href = '/'; // Or use useNavigate if in a component context
  };  const demoLogin = async () => {
    try {
      setError(null);
      console.log('Attempting demo login...');
      // Try to login with the demo user first
      const loginResponse = await login('demo@example.com', 'demo123');
      if (loginResponse.success) {
        console.log('Demo login successful');
        return loginResponse;
      }
      
      console.log('Demo login failed, trying to register...');
      // If login fails, try to register the demo user
      const registerResponse = await register('Demo User', 'demo@example.com', 'demo123');
      if (registerResponse.success) {
        console.log('Demo registration successful');
        return registerResponse;
      }
      
      // If both fail, return the error
      console.log('Both demo login and registration failed');
      return registerResponse;
    } catch (error) {
      console.error('Demo login/register error:', error);
      setError(error.response?.data?.msg || 'Demo login failed');
      return { success: false, error: error.response?.data?.msg || 'Demo login failed' };
    }
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    demoLogin,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;