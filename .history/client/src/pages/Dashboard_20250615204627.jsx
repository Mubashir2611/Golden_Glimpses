import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon, 
  Lock as LockIcon, 
  AddCircleOutline as AddIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';

const Dashboard = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch capsules from API
    // For now, we'll use mock data
    const mockCapsules = [
      {
        id: 1,
        title: 'College Memories',
        description: 'Photos and videos from freshman year',
        createdAt: new Date('2024-04-15'),
        unlockDate: new Date('2026-05-20'),
        thumbnailUrl: '/public/uploads/file-1749653185247-851254313.jpeg',
        mediaCount: 12,
        status: 'locked'
      },
      {
        id: 2,
        title: 'Summer Vacation 2024',
        description: 'Trip to the beach with friends',
        createdAt: new Date('2024-06-01'),
        unlockDate: new Date('2025-01-01'),
        thumbnailUrl: '/public/uploads/file-1749653207514-474827597.jpg',
        mediaCount: 8,
        status: 'locked'
      },
      {
        id: 3,
        title: 'Birthday Wishes',
        description: 'Messages from family and friends',
        createdAt: new Date('2024-03-10'),
        unlockDate: new Date('2025-03-10'),
        thumbnailUrl: '/public/uploads/file-1749653219533-585991885.jpg',
        mediaCount: 5,
        status: 'locked'
      }
    ];
    
    setTimeout(() => {
      setCapsules(mockCapsules);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Time Capsules
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 2,
                background: 'linear-gradient(45deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)',
                },
              }}
            >
              Create New Capsule
            </Button>
          </motion.div>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {capsules.map((capsule, index) => (
              <Grid item xs={12} sm={6} md={4} key={capsule.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={capsule.thumbnailUrl}
                        alt={capsule.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 2,
                        }}
                      >
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.5)',
                            }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          zIndex: 2,
                        }}
                      >
                        <Chip
                          icon={<LockIcon sx={{ fontSize: '0.8rem', color: 'white' }} />}
                          label="Locked"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {capsule.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                        {capsule.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Unlocks in {formatDistanceToNow(capsule.unlockDate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Created {format(capsule.createdAt, 'MMM dd, yyyy')}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {capsule.mediaCount} items
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Create Capsule Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Create New Time Capsule</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Capsule Title"
            type="text"
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
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
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{
              mb: 2,
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
            margin="dense"
            label="Unlock Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '8px',
              py: 0.75,
              px: 2,
              background: 'linear-gradient(45deg, #6366F1 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)',
              },
            }}
          >
            Create & Add Media
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
