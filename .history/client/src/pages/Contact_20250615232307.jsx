import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  TextField, 
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formValues.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formValues.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formValues.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formValues.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formValues.message.trim()) {
      errors.message = 'Message is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real application, implement API call to submit the form
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormValues({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Your message has been sent successfully! We\'ll get back to you soon.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const contactInfo = [
    {
      icon: <EmailIcon fontSize="large" color="primary" />,
      title: 'Email Us',
      content: 'contact@timecapsule.com',
      link: 'mailto:contact@timecapsule.com'
    },
    {
      icon: <PhoneIcon fontSize="large" color="primary" />,
      title: 'Call Us',
      content: '+1 (123) 456-7890',
      link: 'tel:+11234567890'
    },
    {
      icon: <LocationIcon fontSize="large" color="primary" />,
      title: 'Visit Us',
      content: '123 Memory Lane, Digital City, CA 94103',
      link: 'https://maps.google.com/?q=123+Memory+Lane,+San+Francisco,+CA+94103'
    }
  ];

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
            Contact Us
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Have questions or feedback? We'd love to hear from you.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={6}>
        <Grid item xs={12} md={5}>
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
                Get in Touch
              </Typography>
              <Typography variant="body1" paragraph>
                We're here to help with any questions you might have about our service.
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                {contactInfo.map((info, index) => (
                  <Box key={index} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {info.icon}
                      <Typography variant="h6" sx={{ ml: 2 }}>
                        {info.title}
                      </Typography>
                    </Box>
                    <Link 
                      href={info.link} 
                      underline="hover" 
                      color="text.primary"
                      sx={{ display: 'block', pl: 5 }}
                    >
                      {info.content}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={7}>
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
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Send a Message
              </Typography>
              
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formValues.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formValues.subject}
                      onChange={handleChange}
                      error={!!formErrors.subject}
                      helperText={formErrors.subject}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Message"
                      name="message"
                      multiline
                      rows={5}
                      value={formValues.message}
                      onChange={handleChange}
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                      required
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact;
