import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import VerticalBackgroundSlider from '../components/VerticalBackgroundSlider';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, user, logout } = useAuth();
  const backgroundImages = [
    'public/assests/images/slides.jpg',
    'public/assests/images/slides2.jpg',
    'public/assests/images/slides3.jpg'
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
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      handleCloseModal();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError('');
  };
  return (
    <div className="min-h-screen w-full relative">
      {/* Vertical Background Slider */}
      <VerticalBackgroundSlider 
        images={backgroundImages}
        interval={2000}
        overlayOpacity={0.75}
      />
      
      {/* Fixed Navbar */}
      <Navbar 
        onShowAuth={handleShowAuth}
        isLoggedIn={isAuthenticated}
        onLogout={logout}
        user={user}
      />
      
      {/* Main Content - Empty middle section */}
      <div 
        className="min-h-screen w-full flex items-center justify-center relative"
        style={{
          paddingTop: '80px' // Account for fixed navbar
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 20 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 80px)',
              textAlign: 'center',
              py: 4,
            }}
          >
            {/* Empty space - all content removed */}
          </Box>
        </Container>
      </div>

      {/* Auth Modal */}
      <Modal
        open={showAuthModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Paper
            sx={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: 4,
              maxWidth: 400,
              width: '100%',
              position: 'relative',
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
              {authMode === 'login' ? 'Welcome Back' : 'Join Time Capsule'}
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