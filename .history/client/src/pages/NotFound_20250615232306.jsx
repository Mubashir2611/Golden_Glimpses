import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SentimentVeryDissatisfied as SadFaceIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: theme => `0 10px 40px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        >
          <SadFaceIcon sx={{ fontSize: 100, color: 'primary.main', mb: 3 }} />
        </motion.div>

        <Typography 
          variant="h2" 
          component={motion.h2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          fontWeight="bold" 
          gutterBottom
        >
          404
        </Typography>
        
        <Typography 
          variant="h4" 
          component={motion.h4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          gutterBottom
        >
          Page Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
        >
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back to where you need to be.
        </Typography>

        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          sx={{ mt: 4 }}
        >
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2, borderRadius: 2, px: 4, py: 1.5 }}
          >
            Go Home
          </Button>
          <Button
            component={Link}
            to="/dashboard"
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ borderRadius: 2, px: 4, py: 1.5 }}
          >
            Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
