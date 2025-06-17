import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import BackgroundSlider from '../components/BackgroundSlider';
import LoginRegister from '../features/auth/LoginRegister';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Background images for the slider
  const backgroundImages = [
    '/public/assests/images/slides.jpg',
    '/public/assests/images/slides2.jpg',
    '/public/assests/images/slides3.jpg'
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background slider with Ken Burns effect */}
      <BackgroundSlider 
        images={backgroundImages} 
        interval={6000} 
        effect="kenBurns" 
      />
      
      {/* Hero content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: '80vh',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          {/* Left side - App intro */}
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'white',
                  textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                Preserve Memories,<br />
                <Typography
                  component="span"
                  variant="h2"
                  sx={{
                    color: '#8B5CF6',
                    fontWeight: 700,
                    textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  Unlock Them Later
                </Typography>
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '600px',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                Save photos, videos, and messages in digital time capsules. 
                Lock them away until the perfect moment to revisit and rediscover.
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="text-lg">📸</span> Photo Memories
                  </Typography>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="text-lg">🎬</span> Video Moments
                  </Typography>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="text-lg">✏️</span> Personal Notes
                  </Typography>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
          
          {/* Right side - Login/Register form */}
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <LoginRegister />
            </motion.div>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default LandingPage;
