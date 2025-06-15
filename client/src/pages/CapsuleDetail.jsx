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
  CircularProgress
} from '@mui/material';
import { 
  LockClock as LockClockIcon, 
  CalendarToday as CalendarTodayIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon, 
  TextSnippet as TextIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const CapsuleDetail = () => {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, fetch capsule from API
    // For this demo, we'll use mock data
    setTimeout(() => {
      setCapsule({
        id: parseInt(id),
        title: 'College Memories',
        description: 'Photos and videos from my college years. Looking back at the fun times, challenging projects, and amazing friends that made these years special.',
        createdAt: new Date('2024-04-15'),
        unlockDate: new Date('2026-05-20'),
        status: 'locked',
        owner: {
          name: 'Demo User',
          avatar: '/assets/avatar.jpg'
        },
        mediaItems: [
          {
            id: 1,
            type: 'image',
            url: '/public/uploads/file-1749653185247-851254313.jpeg',
            title: 'Campus Day',
            addedAt: new Date('2024-04-15')
          },
          {
            id: 2,
            type: 'image',
            url: '/public/uploads/file-1749653207514-474827597.jpg',
            title: 'Project Presentation',
            addedAt: new Date('2024-04-16')
          },
          {
            id: 3,
            type: 'video',
            url: '/public/uploads/file-1749654108182-535935873.jpeg',  // Just using an image as placeholder
            title: 'Graduation Ceremony',
            addedAt: new Date('2024-04-17')
          },
          {
            id: 4,
            type: 'text',
            content: 'I remember the feeling of accomplishment on the day we completed our final project. Hours of coding, design work, and troubleshooting finally paid off when we presented to the class and received great feedback. A moment to treasure forever.',
            title: 'Project Completion',
            addedAt: new Date('2024-04-18')
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, [id]);
  
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
  
  const isUnlocked = isPast(capsule?.unlockDate);
  
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
                  src={capsule.mediaItems[0]?.url || '/assets/capsule-placeholder.jpg'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: !isUnlocked ? 'blur(16px)' : 'none',
                    transition: 'filter 0.5s ease'
                  }}
                  alt={capsule.title}
                />
                
                {!isUnlocked && (
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
                    {capsule.title}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LockClockIcon sx={{ fontSize: 20, mr: 1, color: 'rgba(255,255,255,0.6)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {isUnlocked 
                          ? `Unlocked on ${format(capsule.unlockDate, 'MMM dd, yyyy')}` 
                          : `Unlocks on ${format(capsule.unlockDate, 'MMM dd, yyyy')}`}
                      </Typography>
                    </Box>
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
                    label={`${capsule.mediaItems.filter(item => item.type === 'text').length} Notes`}
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
                  {isUnlocked ? 'Capsule Unlocked' : 'Capsule Locked'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {isUnlocked 
                    ? 'This capsule is now available to view and share.' 
                    : `This capsule will unlock in ${formatDistanceToNow(capsule.unlockDate)}.`}
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
        
        {/* Media preview (blurred if locked) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
            Capsule Contents
          </Typography>
          
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
                            filter: !isUnlocked ? 'blur(16px)' : 'none',
                          }}
                        />
                        {!isUnlocked && (
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
                            filter: !isUnlocked ? 'blur(16px)' : 'none',
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
                            bgcolor: !isUnlocked ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
                          }}
                        >
                          {!isUnlocked ? (
                            <LockClockIcon sx={{ fontSize: 32, color: 'white' }} />
                          ) : (
                            <VideoIcon sx={{ fontSize: 32, color: 'white' }} />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Text Content */}
                    {item.type === 'text' && (
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
                        {isUnlocked ? (
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
        </motion.div>
      </Box>
    </DashboardLayout>
  );
};

export default CapsuleDetail;
