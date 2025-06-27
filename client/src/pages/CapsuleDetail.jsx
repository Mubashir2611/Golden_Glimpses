import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Divider, 
  Button, 
  Chip, 
  Avatar,
  IconButton,
  CircularProgress,
  Modal,
  Backdrop
} from '@mui/material';
import { 
  LockClock as LockClockIcon, 
  Lock as LockIcon,
  CalendarToday as CalendarTodayIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon, 
  TextSnippet as TextIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Added RouterLink for potential back buttons etc.
import DashboardLayout from '../layouts/DashboardLayout';
import { capsuleAPI } from '../utils/api'; // Import API utility
import { Alert } from '@mui/material'; // For error display

const CapsuleDetail = () => {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageList, setImageList] = useState([]);
  
  // Image viewer functions
  const openImageViewer = (imageIndex) => {
    const images = capsule.mediaItems.filter(item => item.type === 'image');
    setImageList(images);
    setCurrentImageIndex(imageIndex);
    setImageViewerOpen(true);
  };
  
  const closeImageViewer = () => {
    setImageViewerOpen(false);
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };
  
  useEffect(() => {
    const fetchCapsuleData = async () => {
      if (!id) {
        setError("Capsule ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await capsuleAPI.getCapsuleById(id);
        
        // Handle the new API response format
        let fetchedCapsule;
        if (response.data.success && response.data.capsule) {
          fetchedCapsule = response.data.capsule;
        } else if (response.data._id) {
          // Fallback to direct capsule data
          fetchedCapsule = response.data;
        } else {
          throw new Error('Invalid response format');
        }
        
        // 🔧 FIXED: More robust date processing
        fetchedCapsule.createdAt = new Date(fetchedCapsule.createdAt);
        
        // Handle unlock date with better parsing
        const rawUnlockDate = fetchedCapsule.unlockDate || fetchedCapsule.unsealingDate;
        fetchedCapsule.unlockDate = new Date(rawUnlockDate);
        
        // Validate the parsed date
        if (isNaN(fetchedCapsule.unlockDate.getTime())) {
          console.error('Failed to parse unlock date:', rawUnlockDate);
          // Try alternative parsing
          fetchedCapsule.unlockDate = new Date(Date.parse(rawUnlockDate));
        }
        
        console.log('📅 Date parsing debug:', {
          raw: rawUnlockDate,
          parsed: fetchedCapsule.unlockDate.toISOString(),
          isValid: !isNaN(fetchedCapsule.unlockDate.getTime())
        });
        
        if (fetchedCapsule.unlockedAt) {
          fetchedCapsule.unlockedAt = new Date(fetchedCapsule.unlockedAt);
        }
        
        // Ensure mediaItems (memories) also have dates parsed if necessary
        if (fetchedCapsule.memories && fetchedCapsule.memories.length > 0) {
          fetchedCapsule.mediaItems = fetchedCapsule.memories.map(mem => ({
            ...mem,
            id: mem._id, // Use _id as id
            url: mem.content?.fileUrl,
            title: mem.title || mem.content?.fileName || 'Memory Item',
            type: mem.type, // image, video, text, etc.
            content: mem.content?.text, // For text memories
            addedAt: new Date(mem.createdAt)
          }));
        } else if (fetchedCapsule.media && fetchedCapsule.media.length > 0) {
          // Handle direct media array from backend
          fetchedCapsule.mediaItems = fetchedCapsule.media.map(mediaItem => ({
            id: mediaItem._id || Math.random().toString(),
            url: mediaItem.url,
            title: mediaItem.filename || 'Media Item',
            type: mediaItem.type,
            content: mediaItem.type === 'note' ? mediaItem.url : undefined,
            addedAt: new Date(fetchedCapsule.createdAt)
          }));
        } else {
          fetchedCapsule.mediaItems = [];
        }

        setCapsule(fetchedCapsule);
      } catch (err) {
        console.error("Error fetching capsule details:", err);
        setError(err.response?.data?.message || err.message || "Could not load capsule details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCapsuleData();
  }, [id]);
  
  // Add keyboard navigation for image viewer
  useEffect(() => {
    if (imageViewerOpen) {
      const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
          setImageViewerOpen(false);
        } else if (event.key === 'ArrowRight') {
          setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
        } else if (event.key === 'ArrowLeft') {
          setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
        }
      };
      
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [imageViewerOpen, imageList.length]);
  
  // 🔄 Auto-refresh for unlock status - check every 10 seconds
  useEffect(() => {
    if (!capsule || capsule.isPublic) return;
    
    const currentTime = new Date();
    const unlockTime = new Date(capsule.unlockDate);
    const isCurrentlyUnlocked = currentTime.getTime() >= unlockTime.getTime();
    
    if (isCurrentlyUnlocked) return; // Already unlocked, no need to check
    
    console.log('⏰ Setting up auto-refresh for unlock check');
    
    const interval = setInterval(() => {
      const now = new Date();
      const shouldBeUnlocked = now.getTime() >= unlockTime.getTime();
      
      console.log('🔄 Auto-refresh check:', {
        now: now.toISOString(),
        unlock: unlockTime.toISOString(),
        shouldUnlock: shouldBeUnlocked
      });
      
      if (shouldBeUnlocked) {
        console.log('✅ Auto-refresh: Capsule should now be unlocked, reloading...');
        window.location.reload();
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      console.log('🛑 Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [capsule]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '50vh'
        }}>
          <CircularProgress color="primary" />
        </Box>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      </DashboardLayout>
    );
  }

  if (!capsule) { // Handles case where capsule is null after loading (e.g. not found but no specific error string)
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Capsule not found.</Typography>
        </Box>
      </DashboardLayout>
    );
  }
  
  // 🔧 FIXED: Robust unlock check with proper date handling
  const currentTime = new Date();
  const unlockTime = new Date(capsule.unlockDate);
  
  // Ensure both dates are valid and use millisecond comparison for accuracy
  let isUnlocked = false;
  if (isNaN(unlockTime.getTime())) {
    console.error('Invalid unlock date:', capsule.unlockDate);
    isUnlocked = false;
  } else {
    // Use millisecond comparison for accuracy
    isUnlocked = currentTime.getTime() >= unlockTime.getTime();
  }
  
  // 🐛 DEBUG: Show exact timing information
  console.log('🔍 Unlock Debug Info:', {
    current: currentTime.toISOString(),
    unlock: unlockTime.toISOString(),
    currentMs: currentTime.getTime(),
    unlockMs: unlockTime.getTime(),
    difference: (currentTime.getTime() - unlockTime.getTime()) / 1000 / 60, // minutes
    isUnlocked: isUnlocked,
    shouldShowMedia: capsule.isPublic || isUnlocked
  });
  
  // Media visibility logic:
  // - Public capsules: Always show media
  // - Private/Sealed capsules: Only show media if unlocked
  const shouldShowMedia = capsule.isPublic || isUnlocked;
  
  return (
    <DashboardLayout>
      <Box sx={{ pb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header/Summary Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Left side - Cover Image */}
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '300px' },
                  height: { xs: '200px', md: '300px' },
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Box
                  component="img"
                  src={capsule.mediaItems && capsule.mediaItems.length > 0 && capsule.mediaItems[0].url ? capsule.mediaItems[0].url : '/assets/capsule-placeholder.jpg'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: (!isUnlocked && !capsule.isPublic) ? 'blur(16px)' : 'none',
                    transition: 'filter 0.5s ease'
                  }}
                  alt={capsule.name} // Use capsule.name
                />
                
                {!isUnlocked && !capsule.isPublic && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 1
                    }}
                  >
                    {/* Only show unlock countdown for private capsules */}
                    <LockClockIcon sx={{ fontSize: 48, color: 'white', opacity: 0.9, mb: 1 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'white', 
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 12px',
                        borderRadius: 1,
                        fontWeight: 'medium'
                      }}
                    >
                      Unlocks in {formatDistanceToNow(capsule.unlockDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Right side - Capsule Info */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    {capsule.name} {/* Use capsule.name */}
                  </Typography>
                  
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.05)', 
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } 
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={capsule.owner?.avatar} 
                    alt={capsule.owner?.name || 'User'}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {capsule.owner?.name?.[0] || 'U'}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Created by {capsule.owner?.name || 'User'}
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)' }}>
                  {capsule.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon sx={{ fontSize: 20, mr: 1, color: 'rgba(255,255,255,0.6)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Created on {format(capsule.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {/* Only show unlock date for private capsules */}
                    {!capsule.isPublic && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LockClockIcon sx={{ fontSize: 20, mr: 1, color: 'rgba(255,255,255,0.6)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {isUnlocked 
                            ? `Unlocked on ${format(capsule.unlockDate, 'MMM dd, yyyy \'at\' h:mm a')}` 
                            : `Unlocks on ${format(capsule.unlockDate, 'MMM dd, yyyy \'at\' h:mm a')}`}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<ImageIcon sx={{ fontSize: '0.8rem !important' }} />}
                    label={`${capsule.mediaItems.filter(item => item.type === 'image').length} Photos`}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: '#10B981',
                      }
                    }}
                    size="small"
                  />
                  
                  <Chip
                    icon={<VideoIcon sx={{ fontSize: '0.8rem !important' }} />}
                    label={`${capsule.mediaItems.filter(item => item.type === 'video').length} Videos`}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: '#F59E0B',
                      }
                    }}
                    size="small"
                  />
                  
                  <Chip
                    icon={<TextIcon sx={{ fontSize: '0.8rem !important' }} />}
                    label={`${capsule.mediaItems.filter(item => item.type === 'text' || item.type === 'note').length} Notes`}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: '#6366F1',
                      }
                    }}
                    size="small"
                  />
                  
                  <Chip
                    label={`Total: ${capsule.mediaItems.length} items`}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    }}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
        
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: isUnlocked 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)' 
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              border: '1px solid',
              borderColor: isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isUnlocked ? (
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    bgcolor: 'rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LockClockIcon sx={{ color: '#10B981' }} />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LockClockIcon sx={{ color: '#6366F1' }} />
                </Box>
              )}
              
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  {isUnlocked ? 'Capsule Unlocked' : (capsule.isPublic ? 'Public Capsule' : 'Capsule Locked')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {isUnlocked 
                    ? 'This capsule is now available to view and share.' 
                    : (capsule.isPublic 
                        ? 'This is a public capsule available for everyone to explore.'
                        : `This capsule will unlock on ${capsule.unlockDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} (${formatDistanceToNow(capsule.unlockDate)} from now).`)}
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="contained"
              disabled={!isUnlocked}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 3,
                background: isUnlocked 
                  ? 'linear-gradient(45deg, #10B981 0%, #059669 100%)' 
                  : 'linear-gradient(45deg, #6366F1 0%, #4F46E5 100%)',
                opacity: isUnlocked ? 1 : 0.7,
                '&:hover': {
                  background: isUnlocked 
                    ? 'linear-gradient(45deg, #0D9488 0%, #047857 100%)' 
                    : 'linear-gradient(45deg, #4F46E5 0%, #4338CA 100%)',
                },
              }}
            >
              {isUnlocked ? 'View Contents' : 'Locked'}
            </Button>
          </Box>
        </motion.div>
        
        {/* Media Visibility Information */}
        {capsule.isPublic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PublicIcon sx={{ color: '#10B981', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#10B981' }}>
                  Public Capsule
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Since this is a public capsule, all media content is visible immediately to everyone. 
                You can enjoy the photos, videos, and memories shared by the creator right now!
              </Typography>
            </Box>
          </motion.div>
        )}
        
        {/* Media preview (blurred if locked) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
            Capsule Contents
          </Typography>
          
          {capsule.mediaItems && capsule.mediaItems.length > 0 ? (
            <Grid container spacing={3}>
              {capsule.mediaItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {/* Image Content */}
                      {item.type === 'image' && (
                        <Box 
                          sx={{ 
                            position: 'relative', 
                            pt: '60%',
                            cursor: shouldShowMedia ? 'pointer' : 'default',
                            '&:hover': shouldShowMedia ? {
                              '& .zoom-overlay': {
                                opacity: 1,
                              }
                            } : {}
                          }}
                          onClick={() => {
                            if (shouldShowMedia) {
                              const imageIndex = capsule.mediaItems
                                .filter(mediaItem => mediaItem.type === 'image')
                                .findIndex(img => img.id === item.id);
                              openImageViewer(imageIndex);
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={item.url}
                            alt={item.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: !shouldShowMedia ? 'blur(16px)' : 'none',
                            }}
                          />
                          
                          {/* Zoom overlay for unlocked images */}
                          {shouldShowMedia && (
                            <Box 
                              className="zoom-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                              }}
                            >
                              <ZoomInIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                          )}
                          
                          {!shouldShowMedia && (
                            <Box 
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.4)',
                              }}
                            >
                              <LockClockIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {/* Video Content */}
                      {item.type === 'video' && (
                        <Box sx={{ position: 'relative', pt: '60%' }}>
                          <CardMedia
                            component="img"
                            image={item.url}
                            alt={item.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: !shouldShowMedia ? 'blur(16px)' : 'none',
                            }}
                          />
                          <Box 
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: !shouldShowMedia ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
                            }}
                          >
                            {!shouldShowMedia ? (
                              <LockClockIcon sx={{ fontSize: 32, color: 'white' }} />
                            ) : (
                              <VideoIcon sx={{ fontSize: 32, color: 'white' }} />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {/* Text Content */}
                      {(item.type === 'text' || item.type === 'note') && (
                        <Box 
                          sx={{ 
                            height: '160px', 
                            bgcolor: 'rgba(55, 65, 81, 0.3)',
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {shouldShowMedia ? (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: 'vertical',
                                textAlign: 'center',
                                lineHeight: 1.6,
                                fontStyle: 'italic'
                              }}
                            >
                              "{item.content}"
                            </Typography>
                          ) : (
                            <>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 5,
                                  WebkitBoxOrient: 'vertical',
                                  textAlign: 'center',
                                  filter: 'blur(8px)',
                                  userSelect: 'none'
                                }}
                              >
                                {item.content}
                              </Typography>
                              <Box 
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'rgba(0,0,0,0.4)',
                                }}
                              >
                                <LockClockIcon sx={{ fontSize: 32, color: 'white' }} />
                              </Box>
                            </>
                          )}
                        </Box>
                      )}
                      
                      <CardContent>
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
                          {item.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Added on {format(item.addedAt, 'MMM dd, yyyy')}
                          </Typography>
                          
                          <Chip
                            label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              bgcolor: 
                                item.type === 'image' ? 'rgba(16, 185, 129, 0.2)' : 
                                item.type === 'video' ? 'rgba(245, 158, 11, 0.2)' : 
                                'rgba(99, 102, 241, 0.2)',
                              color: 
                                item.type === 'image' ? '#10B981' : 
                                item.type === 'video' ? '#F59E0B' : 
                                '#6366F1',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                borderRadius: 2,
                border: '2px dashed rgba(255, 255, 255, 0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <LockClockIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                No Media Content
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                This time capsule doesn't contain any photos, videos, or notes yet.
              </Typography>
            </Box>
          )}
        </motion.div>
      </Box>
      
      {/* Full-screen Image Viewer Modal */}
      <Modal
        open={imageViewerOpen}
        onClose={closeImageViewer}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
        >
          {imageList.length > 0 && (
            <>
              {/* Close button */}
              <IconButton
                onClick={closeImageViewer}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1001,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Previous button */}
              {imageList.length > 1 && (
                <IconButton
                  onClick={prevImage}
                  sx={{
                    position: 'absolute',
                    left: 20,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1001,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              )}

              {/* Next button */}
              {imageList.length > 1 && (
                <IconButton
                  onClick={nextImage}
                  sx={{
                    position: 'absolute',
                    right: 20,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1001,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              )}

              {/* Image counter */}
              {imageList.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    zIndex: 1001,
                  }}
                >
                  <Typography variant="body2">
                    {currentImageIndex + 1} of {imageList.length}
                  </Typography>
                </Box>
              )}

              {/* Main image */}
              <Box
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={imageList[currentImageIndex]?.url}
                  alt={imageList[currentImageIndex]?.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </Box>

              {/* Image title */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 80,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  zIndex: 1001,
                  maxWidth: '80vw',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {imageList[currentImageIndex]?.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Click outside or press ESC to close • Use arrow keys to navigate
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </DashboardLayout>
  );
};

export default CapsuleDetail;
