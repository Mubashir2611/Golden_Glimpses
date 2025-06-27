import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import StoriesTray from '../components/StoriesTray';

const Explore = () => {
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Memories
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Share your moments and explore stories from the community
          </Typography>
        </Box>

        {/* Stories Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 4
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            ✨ Share Your Story
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            Create memories that disappear in 24 hours, just like Instagram Stories. 
            Add text, draw, and share your moments with the world.
          </Typography>
        </Paper>

        {/* Stories Tray Component */}
        <StoriesTray />

        {/* Additional Info Section */}
        <Box sx={{ mt: 6 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🎬 How Stories Work
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>📸</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Create
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Upload photos or videos and add creative overlays
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>🎨</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Customize
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Add text, drawings, and set viewing duration
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>⏰</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Auto-Vanish
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Stories automatically disappear after 24 hours
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default Explore;
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentCapsuleImages, setCurrentCapsuleImages] = useState([]);
  
  // Image viewer functions
  const openImageViewer = (capsule) => {
    const images = capsule.media?.filter(item => item.type === 'image') || [];
    setCurrentCapsuleImages(images);
    setCurrentImageIndex(0);
    setImageViewerOpen(true);
  };
  
  const closeImageViewer = () => {
    setImageViewerOpen(false);
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentCapsuleImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentCapsuleImages.length) % currentCapsuleImages.length);
  };
  
  useEffect(() => {
    const fetchPublicCapsules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await capsuleAPI.getPublicCapsules(page, 10, searchTerm);
        
        if (response.data.success) {
          setPublicCapsules(response.data.capsules);
        } else {
          setError('Failed to load public capsules');
        }
      } catch (error) {
        console.error('Error fetching public capsules:', error);
        setError(error.response?.data?.message || 'Failed to load public capsules');
        
        // Fallback to mock data if API fails
        const mockCapsules = [
          {
            id: 'p1',
            title: 'College Graduation 2025',
            creatorName: 'Admin',
            description: 'Memories from our amazing graduation ceremony',
            thumbnailUrl: '/public/assets/images/slides.jpg',
            unlockDate: new Date('2025-06-10'),
            mediaCount: 24,
            likes: 42,
            isLiked: false,
            tags: ['graduation', 'college', 'ceremony'],
            isPublic: true
          },
          {
            id: 'p2',
            title: 'Summer Beach Trip',
            creatorName: 'Jamie Lee',
            description: 'Beach vacation with friends in California',
            thumbnailUrl: '/public/assets/images/slides2.jpg',
            unlockDate: new Date('2025-08-20'),
            mediaCount: 36,
            likes: 18,
            isLiked: true,
            tags: ['beach', 'summer', 'friends', 'vacation'],
            isPublic: true
          },
          {
            id: 'p3',
            title: 'Family Reunion 2025',
            creatorName: 'Jordan Taylor',
            description: 'First family get-together since the pandemic',
            thumbnailUrl: '/public/assets/images/slides3.jpg',
            unlockDate: new Date('2026-01-15'),
            mediaCount: 42,
            likes: 27,
            isLiked: false,
            tags: ['family', 'reunion', 'celebration'],
            isPublic: true
          },
          {
            id: 'p4',
            title: 'Darjeeling Trip',
            creatorName: 'Sam Jones',
            description: 'Weekend exploring the Big Apple',
            thumbnailUrl: '/public/assets/images/slides.jpg',
            unlockDate: new Date('2025-12-01'),
            mediaCount: 18,
            likes: 31,
            isLiked: false,
            tags: ['travel', 'nyc', 'city', 'adventure'],
            isPublic: true
          },
          {
            id: 'p5',
            title: 'First Marathon',
            creatorName: 'Taylor Smith',
            description: 'Training and completing my first marathon',
            thumbnailUrl: '/public/assets/images/slides2.jpg',
            unlockDate: new Date('2025-10-10'),
            mediaCount: 15,
            likes: 48,
            isLiked: false,
            tags: ['running', 'marathon', 'fitness', 'achievement'],
            isPublic: true
          },
          {
            id: 'p6',
            title: 'Art Exhibition 2025',
            creatorName: 'Robin Chen',
            description: 'My first solo art exhibition',
            thumbnailUrl: '/public/assets/images/slides3.jpg',
            unlockDate: new Date('2025-09-15'),
            mediaCount: 30,
            likes: 56,
            isLiked: true,
            tags: ['art', 'exhibition', 'creative', 'paintings'],
            isPublic: true
          }
        ];
        
        setPublicCapsules(mockCapsules);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicCapsules();
  }, [page, searchTerm]);
  
  // Add keyboard navigation for image viewer
  useEffect(() => {
    if (imageViewerOpen) {
      const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
          setImageViewerOpen(false);
        } else if (event.key === 'ArrowRight') {
          setCurrentImageIndex((prev) => (prev + 1) % currentCapsuleImages.length);
        } else if (event.key === 'ArrowLeft') {
          setCurrentImageIndex((prev) => (prev - 1 + currentCapsuleImages.length) % currentCapsuleImages.length);
        }
      };
      
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [imageViewerOpen, currentCapsuleImages.length]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredCapsules = publicCapsules.filter(capsule => 
    capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capsule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capsule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleLike = (id) => {
    setPublicCapsules(prevCapsules => 
      prevCapsules.map(capsule => {
        if (capsule.id === id) {
          return {
            ...capsule,
            isLiked: !capsule.isLiked,
            likes: capsule.isLiked ? capsule.likes - 1 : capsule.likes + 1
          };
        }
        return capsule;
      })
    );
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Explore Time Capsules
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<SortIcon />}
              size="small"
            >
              Sort
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              size="small"
            >
              Filter
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search public time capsules by title, description, or tag"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredCapsules.map((capsule, index) => (
                <Grid item xs={12} sm={6} md={4} key={capsule.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                  <RouterLink to={`/capsules/${capsule.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <Card sx={{ 
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
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        {/* Show actual media for public capsules */}
                        {capsule.media && capsule.media.length > 0 ? (
                          <Box
                            sx={{ 
                              position: 'relative',
                              cursor: 'pointer',
                              '&:hover': {
                                '& .zoom-overlay': {
                                  opacity: 1,
                                }
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openImageViewer(capsule);
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="160"
                              image={capsule.media[0].url}
                              alt={capsule.title}
                              sx={{ objectFit: 'cover' }}
                            />
                            {/* Zoom overlay */}
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
                              <ZoomInIcon sx={{ fontSize: 24, color: 'white' }} />
                            </Box>
                          </Box>
                        ) : (
                          <CardMedia
                            component="img"
                            height="160"
                            image={capsule.thumbnailUrl || '/public/assets/images/slides.jpg'}
                            alt={capsule.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        
                        {/* Media count overlay for multiple items */}
                        {capsule.media && capsule.media.length > 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              left: 10,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            +{capsule.media.length - 1} more
                          </Box>
                        )}
                        
                        {/* Public badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: 'rgba(16, 185, 129, 0.9)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          PUBLIC
                        </Box>
                        
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
                              bgcolor: 'rgba(0,0,0,0.5)', 
                              color: capsule.isLiked ? '#f44336' : 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLike(capsule.id);
                            }}
                          >
                            {capsule.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {capsule.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                          by {capsule.creatorName}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                          {capsule.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {capsule.tags.map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                color: '#818CF8',
                                fontSize: '0.7rem',
                                height: 20,
                                '&:hover': {
                                  bgcolor: 'rgba(99, 102, 241, 0.3)',
                                }
                              }}
                            />
                          ))}
                        </Box>
                        
                        {/* No locked notice for public capsules - completely removed */}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {capsule.likes}
                            </Typography>
                          </Box>
                          
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {capsule.media?.length || capsule.mediaCount || 0} items
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </RouterLink>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            
            {filteredCapsules.length > 6 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(filteredCapsules.length / 6)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
            
            {filteredCapsules.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6">
                  No time capsules found matching "{searchTerm}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search terms
                </Typography>
              </Box>
            )}
          </>
        )}
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
          {currentCapsuleImages.length > 0 && (
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
              {currentCapsuleImages.length > 1 && (
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
              {currentCapsuleImages.length > 1 && (
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
              {currentCapsuleImages.length > 1 && (
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
                    {currentImageIndex + 1} of {currentCapsuleImages.length}
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
                  src={currentCapsuleImages[currentImageIndex]?.url}
                  alt={`Image ${currentImageIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </Box>

              {/* Instructions */}
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

export default Explore;