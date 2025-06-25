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
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Lock as LockIcon,
  AddCircleOutline as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
import { capsuleAPI, formatTimeRemaining } from '../utils/api';
import { Link } from 'react-router-dom';
import CapsuleCreationModal from '../components/CapsuleCreationModal';
// import { motion } from 'framer-motion'; // Uncomment if you're using Framer Motion

const Dashboard = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const DEFAULT_IMAGE = '/assets/images/slides.jpg'; // from public folder

  const formatThumbnailUrl = (fileUrl) => {
    if (!fileUrl) return DEFAULT_IMAGE;
    return fileUrl.startsWith('http')
      ? fileUrl
      : `http://localhost:5000${fileUrl}`;
  };

  const handleCapsuleCreated = (newCapsule) => {
    console.log("Capsule created:", newCapsule); // DEBUG LOG

    const formattedCapsule = {
      id: newCapsule._id,
      title: newCapsule.name,
      description: newCapsule.description,
      createdAt: new Date(newCapsule.createdAt),
      unlockDate: new Date(newCapsule.unlockDate),
      mediaCount: newCapsule.mediaUrls?.length || 0,
      status: newCapsule.unlocked ? 'unlocked' : 'locked',
      thumbnailUrl: formatThumbnailUrl(newCapsule.mediaUrls?.[0]?.url)
    };

    setCapsules(prev => [formattedCapsule, ...prev]);
    setSnackbar({
      open: true,
      message: 'Time capsule created successfully!',
      severity: 'success'
    });
  };

  const fetchCapsules = async () => {
    setLoading(true);
    try {
      const response = await capsuleAPI.getAllCapsules();

      if (response.data.success) {
        const formattedCapsules = response.data.capsules.map(capsule => ({
          id: capsule._id,
          title: capsule.name,
          description: capsule.description,
          createdAt: new Date(capsule.createdAt),
          unlockDate: new Date(capsule.unlockDate),
          mediaCount: capsule.memoryCount || 0,
          status: capsule.unlocked ? 'unlocked' : 'locked',
          thumbnailUrl: formatThumbnailUrl(capsule.memories?.[0]?.content?.fileUrl)
        }));

        setCapsules(formattedCapsules);
      } else {
        throw new Error('Failed to fetch capsules');
      }
    } catch (err) {
      console.error('Error fetching capsules:', err);
      setError('Failed to load your time capsules. Please try again.');

      // fallback demo data
      setCapsules([
        {
          id: 1,
          title: 'College Memories',
          description: 'Photos and videos from freshman year',
          createdAt: new Date('2024-04-15'),
          unlockDate: new Date('2026-05-20'),
          thumbnailUrl: DEFAULT_IMAGE,
          mediaCount: 12,
          status: 'locked'
        },
        {
          id: 2,
          title: 'Summer Vacation 2024',
          description: 'Trip to the beach with friends',
          createdAt: new Date('2024-06-01'),
          unlockDate: new Date('2025-01-01'),
          thumbnailUrl: '/assets/images/slides2.jpg',
          mediaCount: 8,
          status: 'locked'
        },
        {
          id: 3,
          title: 'Birthday Wishes',
          description: 'Messages from family and friends',
          createdAt: new Date('2024-03-10'),
          unlockDate: new Date('2025-03-10'),
          thumbnailUrl: '/assets/images/slides3.jpg',
          mediaCount: 5,
          status: 'locked'
        }
      ]);

      setSnackbar({
        open: true,
        message: 'Using demo data. Connect to a server for real data.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleSnackbarClose = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <DashboardLayout>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
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

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Time Capsules
          </Typography>

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
                background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)'
              }
            }}
          >
            Create New Capsule
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {capsules.map((capsule, index) => (
              <Grid item xs={12} sm={6} md={4} key={capsule.id}>
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
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.5)'
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
                        zIndex: 2
                      }}
                    >
                      <Chip
                        icon={
                          <LockIcon
                            sx={{ fontSize: '0.8rem', color: 'white' }}
                          />
                        }
                        label="Locked"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      {capsule.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}
                    >
                      {capsule.description}
                    </Typography>

                    <Box
                      sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 16,
                          color:
                            capsule.status === 'unlocked'
                              ? 'rgba(16, 185, 129, 0.8)'
                              : 'rgba(255,255,255,0.5)',
                          mr: 0.5
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            capsule.status === 'unlocked'
                              ? 'rgba(16, 185, 129, 0.8)'
                              : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {capsule.status === 'unlocked'
                          ? 'Ready to open!'
                          : formatTimeRemaining(capsule.unlockDate)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        Created {format(capsule.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }}
                        >
                          {capsule.mediaCount} items
                        </Typography>

                        <Link
                          to={`/capsules/${capsule.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              color: 'primary.main',
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              p: 0.3
                            }}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Link>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <CapsuleCreationModal
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleCapsuleCreated}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
