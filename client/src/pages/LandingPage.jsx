import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  TextField, 
  IconButton, 
  InputAdornment,
  Modal,
  Paper
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import HorizontalBackgroundSlider from '../components/HorizontalBackgroundSlider';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, demoLogin, currentUser, logout } = useAuth();
  const backgroundImages = [
    'public/assests/images/slides.jpg',
    'public/assests/images/new.jpg',
    'public/assests/images/slides4.jpg'
  ];
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
    useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Disable scrolling when landing page is displayed
  useEffect(() => {
    // Save original styles
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    setError('');
    setFormData({ name: '', email: '', password: '' });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await demoLogin();
      if (result.success) {
        handleCloseModal();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (authMode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }
      
      if (result.success) {
        handleCloseModal();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError('');
  };return (
    <div className="min-h-screen w-full relative overflow-hidden responsive-text no-scroll">
      <HorizontalBackgroundSlider 
        images={backgroundImages}
        interval={5000}
        overlayOpacity={0.7}
      />
        <Navbar 
        onShowAuth={handleShowAuth}
        isLoggedIn={isAuthenticated}
        onLogout={logout}
        user={currentUser}
      /><div 
        className="h-screen w-full flex items-center justify-center relative no-scroll"
        style={{
          paddingTop: '80px', 
          overflow: 'hidden', // Prevent any scrolling
          maxHeight: '100vh'
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 20,
            px: { xs: 2, sm: 4, md: 6 } // Responsive padding
          }}
        >          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 80px)',
              maxHeight: 'calc(100vh - 80px)',
              textAlign: 'center',
              py: { xs: 2, sm: 3, md: 4 }, // Reduced padding to prevent overflow
              width: '100%',
              overflow: 'hidden'
            }}
          >
          </Box>
        </Container>
      </div>

      {/* Auth Modal */}      <Modal
        open={showAuthModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >          <Paper
            sx={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: { xs: 3, sm: 4 }, // Responsive padding
              maxWidth: 400,
              width: '100%',
              position: 'relative',
              mx: 2, // Add margin on x-axis for very small screens
              overflowY: 'hidden', // Prevent all scrolling
              maxHeight: '90vh', // Limit height to prevent overflow
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <Close />
            </IconButton>

            {/* Modal Header */}
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                textAlign: 'center',
              }}
            >
              {authMode === 'login' ? 'Welcome Back' : 'Join to Golden Glimpses'}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                mb: 4,
              }}
            >
              {authMode === 'login' 
                ? 'Sign in to access your memories' 
                : 'Create an account to start preserving moments'
              }
            </Typography>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#FCA5A5' }}>
                    {error}
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {authMode === 'register' && (
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#8B5CF6' },
                    }}
                  />
                )}
                
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8B5CF6' },
                  }}
                />
                
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8B5CF6' },
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED, #0891B2)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {loading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </Button>
                
                {/* Demo Login Button */}
                {authMode === 'login' && (
                  <Button
                    onClick={handleDemoLogin}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      borderRadius: 2,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    🚀 Try Demo (demo@example.com)
                  </Button>
                )}
              </Box>
            </form>

            {/* Toggle Auth Mode */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Button
                  onClick={toggleAuthMode}
                  sx={{
                    color: '#8B5CF6',
                    fontWeight: 600,
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', color: '#A78BFA' }
                  }}
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </Button>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Modal>
    </div>
  );
};

export default LandingPage;