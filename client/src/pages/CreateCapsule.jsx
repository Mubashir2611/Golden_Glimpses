import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Check as CheckIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths, format } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
// import CapsuleUploader from '../features/capsules/CapsuleUploader'; // Assuming this is MediaUploader or similar
import MediaUploader from '../components/MediaUploader'; // Using the MediaUploader we reviewed
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Remove local axios instance
import { capsuleAPI } from '../utils/api'; // Import the shared API utility

const steps = ['Details', 'Add Media', 'Review & Seal'];

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [capsuleData, setCapsuleData] = useState({
    title: '',
    description: '',
    unlockDate: addMonths(new Date(), 6), // Default to 6 months from now
    isPublic: false,
    tags: [],
    theme: 'default'
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [capsuleId, setCapsuleId] = useState(null);
  
  const handleNext = () => {
    if (activeStep === 0 && !isDetailsValid()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    // Capsule creation is now deferred to the final step.
    // if (activeStep === 0) {
    //   // Create capsule when moving to step 2
    //   createCapsule(); 
    // }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
    setCapsuleData({
      title: '',
      description: '',
      unlockDate: addMonths(new Date(), 6),
      isPublic: false,
      tags: [],
      theme: 'default'
    });
    setUploadedFiles([]);
    // setCapsuleId(null); // No longer creating capsule prematurely
    setSubmissionError(null);
    setIsSubmitting(false);
  };
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCapsuleData(prev => ({
      ...prev,
      [name]: name === 'isPublic' ? checked : value
    }));
  };
  
  const handleDateChange = (date) => {
    setCapsuleData(prev => ({
      ...prev,
      unlockDate: date
    }));
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const isDetailsValid = () => {
    return capsuleData.title.trim() !== '' && 
           capsuleData.description.trim() !== '' && 
           capsuleData.unlockDate > new Date();
  };
  
  // const createCapsule = async () => { ... }; // This function is removed or repurposed for the final submission.

  const handleFilesChange = (files) => {
    // Files from MediaUploader will have cloudinaryUrl, publicId, etc.
    setUploadedFiles(files); 
  };
  
  const handleSubmitCapsule = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    // Ensure all files intended for upload are actually uploaded
    const pendingUploads = uploadedFiles.filter(f => !f.uploaded && !f.error);

    if (pendingUploads.length > 0) {
      setSubmissionError("Some files haven't been uploaded yet. Please upload all files or remove them before sealing.");
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: "Please upload all selected files first.",
        severity: 'warning'
      });
      return;
    }
    
    // Note: Media will be handled separately through the media upload endpoint
    
    const capsulePayload = {
      title: capsuleData.title, // Changed from 'name' to 'title'
      description: capsuleData.description,
      unlockDate: capsuleData.unlockDate.toISOString(), // Backend will handle both unlockDate/unsealingDate
      isPublic: capsuleData.isPublic,
      // Remove fields not expected by backend
      // tags: capsuleData.tags.filter(tag => tag.trim() !== ''),
      // theme: capsuleData.theme,
      // mediaUrls: mediaUrlsForApi
    };
    
    try {
      const response = await capsuleAPI.createCapsule(capsulePayload);
      
      // Backend returns the capsule object directly
      if (response.data) {
        setSnackbar({
          open: true,
          message: 'Your time capsule has been created! You can add media and seal it.',
          severity: 'success'
        });
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Failed to create the capsule');
      }
    } catch (error) {
      console.error('Error sealing capsule:', error);
      setSubmissionError(error.response?.data?.msg || error.message || 'Failed to seal the time capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ pb: 6 }}>
        {submissionError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setSubmissionError(null)}
          >
            {submissionError}
          </Alert>
        )}
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Create New Time Capsule
            </Typography>
          </Box>
          
          {/* Stepper */}
          <Box sx={{ width: '100%', mb: 5 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                '& .MuiStepConnector-line': {
                  borderTopWidth: 3,
                  borderRadius: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiStepConnector-active .MuiStepConnector-line': {
                  borderColor: 'primary.main',
                },
                '& .MuiStepConnector-completed .MuiStepConnector-line': {
                  borderColor: 'primary.main',
                },
                '& .MuiStepLabel-iconContainer': {
                  '& .MuiStepIcon-root': {
                    color: 'rgba(255, 255, 255, 0.2)',
                    fontSize: 28,
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: 'primary.main',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: 'primary.main',
                  },
                },
                '& .MuiStepLabel-label': {
                  marginTop: 1,
                  fontWeight: 'medium',
                  '&.Mui-active': {
                    color: 'primary.main',
                  },
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </motion.div>
        
        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 0 ? (
              /* Step 1: Capsule Details */
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Capsule Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 2,
                        overflow: 'visible'
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ mb: 3 }}>
                          <TextField
                            label="Capsule Title"
                            name="title"
                            value={capsuleData.title}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            inputProps={{ maxLength: 50 }}
                            helperText={`${capsuleData.title.length}/50 characters`}
                            sx={{
                              mb: 3,
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputBase-input': {
                                color: 'white',
                              },
                            }}
                          />
                          
                          <TextField
                            label="Description"
                            name="description"
                            value={capsuleData.description}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            required
                            inputProps={{ maxLength: 500 }}
                            helperText={`${capsuleData.description.length}/500 characters`}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputBase-input': {
                                color: 'white',
                              },
                            }}
                          />
                        </Box>
                        
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Unlock Date"
                            value={capsuleData.unlockDate}
                            onChange={handleDateChange}
                            minDate={addMonths(new Date(), 1)}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputBase-input': {
                                color: 'white',
                              },
                            }}
                            slotProps={{
                              textField: {
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarIcon sx={{ color: 'white' }} />
                                    </InputAdornment>
                                  ),
                                },
                                helperText: "When should this capsule be unlocked?"
                              }
                            }}
                          />
                        </LocalizationProvider>
                        
                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={capsuleData.isPublic} // Corrected from isPrivate
                                onChange={handleChange}
                                name="isPublic" // Corrected from isPrivate
                                color="primary"
                              />
                            }
                            label="Publicly visible capsule" // Corrected label
                          />
                          <Tooltip title="Public capsules can be seen by others in the Explore feed once unlocked. Private capsules are only for you.">
                            <IconButton size="small" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 2
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                          About Time Capsules
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          Create a digital time capsule to preserve memories that matter. 
                          Add photos, videos, and text that will be sealed until the unlock date.
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(99, 102, 241, 0.1)', 
                            borderRadius: 1,
                            mb: 2,
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ color: 'primary.light', mb: 1 }}>
                            Unlock Date
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Your capsule will unlock on:<br />
                            <strong>{format(capsuleData.unlockDate, 'MMMM dd, yyyy \'at\' h:mm a')}</strong>
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          You can add a variety of media types to your capsule in the next step.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : activeStep === 1 ? (
              /* Step 2: Add Media */
              <MediaUploader 
                onFilesChange={handleFilesChange} 
                // Pass other props like maxFiles, maxSize if needed
              />
            ) : (
              /* Step 3: Review & Seal */
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Review & Seal Your Capsule
                </Typography>
                
                <Card
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                    mb: 4
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                          Capsule Details
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                            Title
                          </Typography>
                          <Typography variant="body1">
                            {capsuleData.title}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                            Description
                          </Typography>
                          <Typography variant="body1">
                            {capsuleData.description}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                            Unlock Date
                          </Typography>
                          <Typography variant="body1">
                            {format(capsuleData.unlockDate, 'MMMM dd, yyyy \'at\' h:mm a')}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                            Privacy
                          </Typography>
                          <Typography variant="body1">
                            {capsuleData.isPrivate ? 'Private' : 'Public'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                          Media Summary
                        </Typography>
                        
                        {/* For demo purposes - in a real app, display actual files added */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                            Total Items
                          </Typography>
                          <Typography variant="body1">
                            6 items
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              gap: 1
                            }}
                          >
                            <ImageIcon sx={{ color: '#10B981', fontSize: 20 }} />
                            <Typography variant="body2">
                              3 Photos
                            </Typography>
                          </Box>
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              gap: 1
                            }}
                          >
                            <VideoIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                            <Typography variant="body2">
                              2 Videos
                            </Typography>
                          </Box>
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              gap: 1
                            }}
                          >
                            <TextIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                            <Typography variant="body2">
                              1 Text
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography variant="body1">
                    By sealing this capsule, you agree that:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                      You own or have permission to use all content
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                      Your capsule will be locked until the unlock date
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      You can delete the capsule at any time
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: 'white',
              }
            }}
          >
            Back
          </Button>
            <Box>
            {activeStep === steps.length - 1 ? (
              <AnimatePresence>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitCapsule}
                    startIcon={isSubmitting ? null : <CheckIcon />}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: '8px',
                      py: 1,
                      px: 3,
                      background: 'linear-gradient(45deg, #10B981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #0D9488 0%, #047857 100%)',
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                        Sealing...
                      </>
                    ) : (
                      "Seal Capsule"
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={isSubmitting ? null : <ForwardIcon />}
                disabled={(activeStep === 0 && !isDetailsValid()) || isSubmitting}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 3,
                  background: 'linear-gradient(45deg, #6366F1 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)',
                  },
                }}
              >
                {activeStep === 0 && isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    Creating...
                  </>
                ) : (
                  activeStep === steps.length - 2 ? 'Review' : 'Continue'
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default CreateCapsule;
