import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Card, 
  CardContent, 
  Button,
  TextField,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; // Import the API utility

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
  const [success, setSuccess] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setUserProfile({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || 'No bio added yet',
        location: currentUser.location || 'Location not specified'
      });
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = avatarPreview;
      // If avatar is changed, upload it
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        const avatarRes = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = avatarRes.data.avatarUrl;
      }

      // Call the API to update user profile
      const response = await api.put('/users/profile', {
        name: userProfile.name,
        bio: userProfile.bio,
        location: userProfile.location,
        avatarUrl
      });
      
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
      <Box sx={{ pb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Profile
            </Typography>
            
            <Button 
              variant={isEditing ? "contained" : "outlined"}
              color={isEditing ? "secondary" : "primary"}
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Saving...
                </>
              ) : isEditing ? 'Save Changes' : 'Edit Profile'}
                  <Avatar 
                    src={avatarPreview}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      bgcolor: '#8B5CF6',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {!avatarPreview && (userProfile.name?.[0]?.toUpperCase() || 'U')}
                  </Avatar>
                  
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                  <label htmlFor="avatar-upload">
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ mb: 2 }}
                      component="span"
                      disabled={!isEditing}
                    >
                      Change Avatar
                    </Button>
                  </label>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {userProfile.name}
                  </Typography>
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {userProfile.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ mb: 2 }}
                    disabled={!isEditing}
                  >
                    Change Avatar
                  </Button>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {userProfile.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {userProfile.email}
                  </Typography>
                  
                  <Chip 
                    icon={<AccountIcon />} 
                    label="Account Member" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 3 }}>
                    Account Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        variant="outlined"
                        fullWidth
                        name="name"
                        value={userProfile.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        name="email"
                        value={userProfile.email}
                        onChange={handleChange}
                        disabled={true} // Email changes typically require verification
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Bio"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        name="bio"
                        value={userProfile.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Location"
                        variant="outlined"
                        fullWidth
                        name="location"
                        value={userProfile.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;
