import { Box, Typography, Container, Grid, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            About Golden Glimpses
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Preserve your memories for the future with our digital time capsule platform
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                height: '100%',
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph>
                Golden Glimpses was created with a simple but powerful mission: to help people preserve their most 
                meaningful memories and share them at just the right moment in the future.
              </Typography>
              <Typography variant="body1" paragraph>
                In our increasingly digital world, our platform offers a unique way to collect and store photos,
                videos, messages, and documents that can be unlocked at a future date of your choosing.
              </Typography>
              <Typography variant="body1">
                Whether it's for personal growth, family history, or special occasions, we believe in the power of 
                connecting our past selves with our future selves and loved ones.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                height: '100%',
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                How It Works
              </Typography>
              <Typography variant="body1" paragraph>
                Creating a time capsule is simple:
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    Create your capsule and set a future unlock date
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    Add photos, videos, text messages, and documents
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    Customize your capsule with themes and privacy settings
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography variant="body1">
                    Receive notifications when it's time to unlock your capsule
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Your memories are securely stored until the unlock date arrives, at which point you can 
                access and share your capsule with others.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Our Team
              </Typography>
              <Typography variant="body1" paragraph>
                Golden Glimpses was founded in 2025 by a team of developers passionate about preserving digital 
                memories. Our diverse team brings together expertise in web development, UX design, security, 
                and cloud infrastructure to create a platform that's both powerful and easy to use.
              </Typography>
              <Typography variant="body1">
                We're committed to privacy, security, and creating a meaningful experience for our users. 
                As we continue to grow, our focus remains on innovation while maintaining the integrity of 
                your precious memories.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
