import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  VisibilityOff as PrivateIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { capsuleAPI } from '../utils/api';

const MyCapsulesPage = () => {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  useEffect(() => {
    fetchUserCapsules();
  }, []);

  const fetchUserCapsules = async () => {
    try {
      setLoading(true);
      const response = await capsuleAPI.getAllCapsules();
      setCapsules(response.data);
    } catch (err) {
      console.error('Error fetching capsules:', err);
      setError('Failed to load your capsules: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, capsule) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedCapsule(capsule);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCapsule(null);
  };

  const handleDeleteClick = () => {
    setCapsuleToDelete(selectedCapsule);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCapsuleToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!capsuleToDelete) return;

    try {
      await capsuleAPI.deleteCapsule(capsuleToDelete._id);
      setCapsules(capsules.filter(c => c._id !== capsuleToDelete._id));
      setDeleteDialogOpen(false);
      setCapsuleToDelete(null);
    } catch (err) {
      console.error('Error deleting capsule:', err);
      setError('Failed to delete capsule: ' + (err.response?.data?.message || err.message));
      setDeleteDialogOpen(false);
      setCapsuleToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unsealed': return 'warning';
      case 'sealed': return 'success';
      case 'locked': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unsealed': return <ScheduleIcon />;
      case 'sealed': return <LockIcon />;
      case 'locked': return <LockIcon />;
      default: return <ScheduleIcon />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Time Capsules
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-capsule')}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED, #0891B2)',
              },
            }}
          >
            Create New Capsule
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Capsules Grid */}
        {capsules.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              No capsules created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Create your first time capsule to preserve your memories
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-capsule')}
            >
              Create Your First Capsule
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {capsules.map((capsule) => (
              <Grid item xs={12} sm={6} md={4} key={capsule._id}>
                <div>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      },
                    }}
                    onClick={() => navigate(`/capsules/${capsule._id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status, Visibility and Menu */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box display="flex" gap={1} alignItems="center">
                          {/* Only show status chip for sealed or locked capsules */}
                          {capsule.status !== 'unsealed' && (
                            <Chip
                              icon={getStatusIcon(capsule.status)}
                              label={capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}
                              color={getStatusColor(capsule.status)}
                              size="small"
                            />
                          )}
                          <Chip
                            icon={capsule.isPublic ? <PublicIcon /> : <PrivateIcon />}
                            label={capsule.isPublic ? 'Public' : 'Private'}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, capsule)}
                          sx={{ 
                            opacity: 0.7,
                            '&:hover': { opacity: 1 }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" component="h3" gutterBottom>
                        {capsule.title}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {capsule.description?.substring(0, 100)}
                        {capsule.description?.length > 100 && '...'}
                      </Typography>

                      {/* Media Count */}
                      {capsule.media && capsule.media.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          📸 {capsule.media.length} media file{capsule.media.length !== 1 ? 's' : ''}
                          {capsule.media.filter(m => m.type === 'image').length > 0 && ` • ${capsule.media.filter(m => m.type === 'image').length} photo${capsule.media.filter(m => m.type === 'image').length !== 1 ? 's' : ''}`}
                          {capsule.media.filter(m => m.type === 'video').length > 0 && ` • ${capsule.media.filter(m => m.type === 'video').length} video${capsule.media.filter(m => m.type === 'video').length !== 1 ? 's' : ''}`}
                        </Typography>
                      )}

                      {/* Unlock Date - Only show for private capsules */}
                      {!capsule.isPublic && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Opens: {new Date(capsule.unlockDate || capsule.unsealingDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-confirmation-dialog"
        >
          <DialogTitle id="delete-confirmation-dialog">
            Confirm Capsule Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="text.secondary">
              Are you sure you want to delete this capsule? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Capsule Menu (More Options) */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Capsule
          </MenuItem>
        </Menu>
      </Box>
    </DashboardLayout>
  );
};

export default MyCapsulesPage;
