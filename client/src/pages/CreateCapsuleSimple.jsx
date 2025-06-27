import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
import MediaUploader from '../components/MediaUploader';
import { useNavigate } from 'react-router-dom';
import { capsuleAPI } from '../utils/api';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unsealingDate: addMonths(new Date(), 1), // Default to 1 month from now
    isPublic: false,
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isPublic' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      unsealingDate: date
    }));
  };

  const handleMediaChange = (files) => {
    // Update uploaded media state with files that have been successfully uploaded
    console.log('handleMediaChange - All files received:', files);
    
    // Let's check different possible conditions for uploaded files
    const uploadedFiles1 = files.filter(file => file.uploaded && file.cloudinaryUrl);
    const uploadedFiles2 = files.filter(file => file.uploaded && file.url);
    const uploadedFiles3 = files.filter(file => file.uploaded);
    
    console.log('handleMediaChange - uploadedFiles (uploaded && cloudinaryUrl):', uploadedFiles1);
    console.log('handleMediaChange - uploadedFiles (uploaded && url):', uploadedFiles2);
    console.log('handleMediaChange - uploadedFiles (uploaded only):', uploadedFiles3);
    
    // Use the files that have both uploaded flag and some URL
    const finalUploadedFiles = files.filter(file => file.uploaded && (file.cloudinaryUrl || file.url));
    console.log('handleMediaChange - Final uploaded files:', finalUploadedFiles);
    
    setUploadedMedia(finalUploadedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your time capsule');
      return;
    }

    if (!formData.unsealingDate || formData.unsealingDate <= new Date()) {
      setError('Please select a future date for unsealing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare media array from uploaded files
      const mediaArray = uploadedMedia.map(file => ({
        url: file.cloudinaryUrl || file.url, // Handle both possible URL fields
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'other',
        filename: file.name
      }));

      console.log('handleSubmit - uploadedMedia:', uploadedMedia);
      console.log('handleSubmit - mediaArray:', mediaArray);

      const capsuleData = {
        title: formData.title,
        description: formData.description,
        unsealingDate: formData.unsealingDate.toISOString(),
        isPublic: formData.isPublic,
        media: mediaArray // Include media in capsule creation
      };

      console.log('handleSubmit - capsuleData:', capsuleData);

      const response = await capsuleAPI.createCapsule(capsuleData);
      
      if (response.data && (response.data.success || response.data._id)) {
        setSuccess('Time capsule created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error creating capsule:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create time capsule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Time Capsule
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Title */}
                <TextField
                  name="title"
                  label="Capsule Title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="What's this capsule about?"
                />

                {/* Description */}
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Tell your future self about this moment..."
                />

                {/* Unsealing Date with Time */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="When should this capsule open?"
                    value={formData.unsealingDate}
                    onChange={handleDateChange}
                    minDateTime={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Choose a future date and time when you want to open this capsule'
                      }
                    }}
                    format="MM/dd/yyyy hh:mm a"
                  />
                </LocalizationProvider>

                {/* Public/Private Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                    />
                  }
                  label="Make this capsule public (others can see it when it opens)"
                />

                {/* Media Upload Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    Add Photos & Videos (Optional)
                  </Typography>
                  <MediaUploader onFilesChange={handleMediaChange} />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED, #0891B2)',
                    },
                  }}
                >
                  {loading ? 'Creating...' : 'Create Time Capsule'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default CreateCapsule;
