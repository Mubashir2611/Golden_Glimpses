import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  PhotoLibrary as PhotoIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import MediaUploader from './MediaUploader';
import { capsuleAPI } from '../utils/api';

const steps = ['Add Media', 'Capsule Details', 'Review & Create'];

const CapsuleCreationModal = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [capsuleData, setCapsuleData] = useState({
    name: '',
    description: '',
    unlockDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    isPublic: false,
    tags: [],
    theme: 'default'
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const handleNext = () => {
    if (activeStep === 0 && mediaFiles.length === 0) {
      setError('Please add at least one media file');
      return;
    }
    
    if (activeStep === 1) {
      if (!capsuleData.name.trim()) {
        setError('Please enter a capsule name');
        return;
      }
      if (!capsuleData.description.trim()) {
        setError('Please enter a description');
        return;
      }
      if (new Date(capsuleData.unlockDate) <= new Date()) {
        setError('Unlock date must be in the future');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && capsuleData.tags.length < 5) {
      setCapsuleData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCapsuleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateCapsule = async () => {
    setLoading(true);
    setError('');

    try {
      // First, ensure all media files are uploaded
      const uploadedFiles = mediaFiles.filter(file => file.uploaded && file.cloudinaryUrl);
      
      if (uploadedFiles.length === 0) {
        throw new Error('Please upload at least one media file');
      }

      // Create capsule with media URLs
      const capsulePayload = {
        ...capsuleData,
        mediaUrls: uploadedFiles.map(file => ({
          url: file.cloudinaryUrl,
          type: file.type,
          name: file.name,
          size: file.size
        }))
      };

      const response = await capsuleAPI.createCapsule(capsulePayload);
      
      if (response.data.success) {
        onSuccess(response.data.capsule);
        handleClose();
      } else {
        throw new Error(response.data.message || 'Failed to create capsule');
      }
    } catch (err) {
      console.error('Error creating capsule:', err);
      setError(err.message || 'Failed to create capsule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setActiveStep(0);
    setCapsuleData({
      name: '',
      description: '',
      unlockDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      isPublic: false,
      tags: [],
      theme: 'default'
    });
    setMediaFiles([]);
    setTagInput('');
    setError('');
    setLoading(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              Add Your Media
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
              Upload photos and videos that you want to include in your time capsule
            </Typography>
            
            <MediaUploader
              onFilesChange={setMediaFiles}
              maxFiles={10}
              maxSize={50 * 1024 * 1024} // 50MB
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              Capsule Details
            </Typography>
            
            <TextField
              autoFocus
              margin="dense"
              label="Capsule Name"
              type="text"
              fullWidth
              variant="outlined"
              value={capsuleData.name}
              onChange={(e) => setCapsuleData(prev => ({ ...prev, name: e.target.value }))}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
              }}
            />

            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={capsuleData.description}
              onChange={(e) => setCapsuleData(prev => ({ ...prev, description: e.target.value }))}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
              }}
            />

            <TextField
              margin="dense"
              label="Unlock Date"
              type="date"
              fullWidth
              variant="outlined"
              value={capsuleData.unlockDate}
              onChange={(e) => setCapsuleData(prev => ({ ...prev, unlockDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' },
              }}
            />

            {/* Tags Input */}
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Add Tags"
                type="text"
                fullWidth
                variant="outlined"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Press Enter to add tag"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
              
              {capsuleData.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {capsuleData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                        color: 'white',
                        '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
              Review Your Capsule
            </Typography>
            
            <Grid container spacing={2}>
              {/* Capsule Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {capsuleData.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                    {capsuleData.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Unlocks: {format(new Date(capsuleData.unlockDate), 'MMMM dd, yyyy')}
                    </Typography>
                  </Box>
                  
                  {capsuleData.tags.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
                        Tags:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {capsuleData.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(99, 102, 241, 0.2)',
                              color: 'white'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {/* Media Summary */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      Media Files ({mediaFiles.length})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {mediaFiles.map((file) => (
                      <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                          {file.name}
                        </Typography>
                        <Chip
                          label={file.uploaded ? 'Ready' : 'Upload needed'}
                          size="small"
                          color={file.uploaded ? 'success' : 'warning'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1e1e1e',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ color: 'white', pb: 1 }}>
        <Typography variant="h5" component="div">
          Create Time Capsule
        </Typography>
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: activeStep >= index ? 'primary.main' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.875rem'
                  },
                  '& .MuiStepIcon-root': {
                    color: activeStep >= index ? 'primary.main' : 'rgba(255,255,255,0.3)',
                  },
                  '& .MuiStepIcon-text': {
                    fill: 'white'
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ color: 'white' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          onClick={handleClose}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: '8px',
              py: 1,
              px: 2,
              background: 'linear-gradient(45deg, #6366F1 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)',
              },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateCapsule}
            disabled={loading || mediaFiles.filter(f => f.uploaded).length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <PublishIcon />}
            sx={{
              borderRadius: '8px',
              py: 1,
              px: 2,
              background: 'linear-gradient(45deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #059669 0%, #047857 100%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Capsule'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CapsuleCreationModal;
