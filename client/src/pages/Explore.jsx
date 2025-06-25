import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  IconButton, 
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  Alert,
  Avatar,
  CardActions
} from '@mui/material';
import { 
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Person as PersonIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatTimeRemaining, capsuleAPI } from '../utils/api';

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [publicCapsules, setPublicCapsules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPublicCapsules = async () => {
      setLoading(true);
      
      try {        const response = await capsuleAPI.getPublicCapsules(page, searchTerm);
        
        if (response.data.success) {
          setPublicCapsules(response.data.capsules.map(capsule => ({
            id: capsule._id,
            title: capsule.name,
            creatorName: capsule.creator?.name || 'Anonymous',
            description: capsule.description,            thumbnailUrl: capsule.memories && capsule.memories[0]?.content?.fileUrl 
              ? `http://localhost:5000${capsule.memories[0].content.fileUrl}`
              : '/public/assets/images/slides.jpg',
            createdAt: new Date(capsule.createdAt),
            unlockDate: new Date(capsule.unlockDate),
            likeCount: capsule.likes?.length || 0,
            isLiked: false 
          })));
        } else {
          throw new Error(response.data.message || 'Failed to fetch public capsules');
        }
      } catch (err) {
        console.error('Error fetching public capsules:', err);
        setError('Failed to load public capsules. Please try again.');
        
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
                            onClick={() => handleLike(capsule.id)}
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
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', mr: 0.5 }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {formatTimeRemaining(capsule.unlockDate)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {capsule.likes}
                            </Typography>
                          </Box>
                          
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
    </DashboardLayout>
  );
};

export default Explore;