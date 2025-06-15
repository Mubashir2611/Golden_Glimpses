import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, validate the token on the server
      // For now, we'll just assume it's valid
      setIsAuthenticated(true);
      
      // You would normally fetch user data here
      // For demo purposes, we'll create a mock user
      setCurrentUser({
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, accept any credentials
      
      // Simulating API request
      // const response = await axios.post('/api/auth/login', { email, password });
      // const { token, user } = response.data;
      
      const token = 'mock-jwt-token';
      const user = {
        id: '1',
        name: 'Demo User',
        email,
      };
      
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, accept any registration
      
      // Simulating API request
      // const response = await axios.post('/api/auth/register', { name, email, password });
      // const { token, user } = response.data;
      
      const token = 'mock-jwt-token';
      const user = {
        id: '1',
        name,
        email,
      };
      
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
