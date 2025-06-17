import { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  TextField, 
  Card, 
  CardMedia, 
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon, 
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as TextIcon,
  AddPhotoAlternate as AddPhotoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const CapsuleUploader = ({ capsuleId, capsuleTitle }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const textInputRef = useRef(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        id: `file-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        status: 'ready'
      }));
      setFiles([...files, ...newFiles]);
    }
  });
  
  const handleAddText = () => {
    setTextModalOpen(true);
  };
  
  const handleTextModalClose = () => {
    setTextModalOpen(false);
  };
  
  const handleSaveText = () => {
    if (textTitle.trim() && textContent.trim()) {
      const newTextItem = {
        id: `text-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type: 'text',
        title: textTitle,
        content: textContent,
        status: 'ready'
      };
      
      setFiles([...files, newTextItem]);
      setTextContent('');
      setTextTitle('');
      setTextModalOpen(false);
    }
  };
  
  const handleRemoveFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };
    const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('capsuleId', capsuleId);
      
      // For each file, create a separate request
      const uploadPromises = files
        .filter(file => file.status === 'ready')
        .map(async (file) => {
          try {
            if (file.type === 'text') {
              // For text memories
              const textData = {
                capsule: capsuleId,
                type: 'text',
                title: file.title,
                content: {
                  text: file.content
                }
              };
              
              // Send API request
              const response = await axios.post(
                'http://localhost:5000/api/memories',
                textData,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              return response.data;
            } else {
              // For file uploads (images/videos)
              const fileFormData = new FormData();
              fileFormData.append('capsule', capsuleId);
              fileFormData.append('type', file.type);
              fileFormData.append('title', file.name || 'Untitled');
              fileFormData.append('file', file);
              
              // Upload with progress tracking
              const response = await axios.post(
                'http://localhost:5000/api/memories/upload',
                fileFormData,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                  },
                  onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                  }
                }
              );
              
              return response.data;
            }
          } catch (error) {
            console.error(`Error uploading file ${file.name || file.title}:`, error);
            return { error: true, file };
          }
        });
      
      // For demo purposes, simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(Math.min(progress, 95)); // Don't reach 100% until all uploads complete
        
        if (progress >= 95) {
          clearInterval(interval);
        }
      }, 200);
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Complete the progress bar
      clearInterval(interval);
      setUploadProgress(100);
      
      // Update file statuses
      const updatedFiles = [...files];
      results.forEach((result, index) => {
        if (!result.error) {
          updatedFiles[index].status = 'uploaded';
          updatedFiles[index].remoteId = result._id || result.id;
        } else {
          updatedFiles[index].status = 'error';
          updatedFiles[index].error = 'Upload failed';
        }
      });
      
      setFiles(updatedFiles);
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error during upload:', error);
      setUploading(false);
      // Mark all files as uploaded
        setFiles(files.map(file => ({
          ...file,
          status: 'uploaded'
        })));
        
        // In a real app, you would submit to server here
        console.log('Files uploaded:', files);
      }
    }, 200);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Add Media to "{capsuleTitle || 'New Capsule'}"
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
          Upload photos, videos, or add text memories to your time capsule. 
          These will be sealed until the unlock date.
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Upload options */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          mb: 4,
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          {/* Dropzone for files */}
          <Box
            {...getRootProps()}
            sx={{
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              bgcolor: isDragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '180px',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(99, 102, 241, 0.05)'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop photos or videos'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              or click to browse from your device
            </Typography>
          </Box>
          
          {/* Text memory button */}
          <Box
            component={motion.div}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddText}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              border: '2px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: { xs: '100%', md: '160px' },
              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: 'rgba(99, 102, 241, 0.05)'
              }
            }}
          >
            <TextIcon sx={{ fontSize: 40, color: '#f97316', mb: 2, opacity: 0.9 }} />
            <Typography variant="body1">
              Add Text Memory
            </Typography>
          </Box>
        </Box>
      </motion.div>
      
      {/* Preview of files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Media ({files.length})
            </Typography>
            
            <Grid container spacing={2}>
              <AnimatePresence>
                {files.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        sx={{ 
                          position: 'relative',
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {file.type === 'image' && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={file.preview}
                            alt={file.name}
                          />
                        )}
                        
                        {file.type === 'video' && (
                          <Box 
                            sx={{ 
                              height: 140, 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#111',
                              position: 'relative'
                            }}
                          >
                            <video
                              src={file.preview}
                              style={{ 
                                maxHeight: '100%', 
                                maxWidth: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                zIndex: 1,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <VideoIcon sx={{ color: 'white' }} />
                            </Box>
                          </Box>
                        )}
                        
                        {file.type === 'text' && (
                          <Box 
                            sx={{ 
                              height: 140, 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#242424',
                              p: 2
                            }}
                          >
                            <TextIcon sx={{ fontSize: 36, color: '#f97316', mb: 2 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'medium',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {file.title}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* File status chip */}
                        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                          <Chip
                            size="small"
                            label={file.status === 'uploaded' ? 'Uploaded' : 'Ready'}
                            sx={{
                              bgcolor: file.status === 'uploaded' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 22
                            }}
                          />
                        </Box>
                        
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="body2" noWrap>
                            {file.name || file.title || 'Memory'}
                          </Typography>
                          
                          {file.type !== 'text' && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </Typography>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ p: 1, pt: 0 }}>
                          {file.type === 'text' && (
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)' }} onClick={() => handleRemoveFile(file.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Box>
          
          {/* Upload progress */}
          {uploading && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 4
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'right', 
                  mt: 1,
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                {uploadProgress}% complete
              </Typography>
            </Box>
          )}
          
          {/* Upload button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined"
              disabled={uploading} 
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.03)',
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 3,
                background: 'linear-gradient(45deg, #6366F1 0%, #8B5CF6 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5458E3 0%, #7C4DE8 100%)',
                },
              }}
            >
              {uploading ? 'Uploading...' : 'Seal Capsule'}
            </Button>
          </Box>
        </motion.div>
      )}
      
      {/* Text Memory Dialog */}
      <Dialog 
        open={textModalOpen} 
        onClose={handleTextModalClose}
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
        <DialogTitle sx={{ color: 'white' }}>Add Text Memory</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
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
            label="Text Memory"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            inputRef={textInputRef}
            placeholder="Write your memory here..."
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
          <Button onClick={handleTextModalClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveText}
            disabled={!textTitle.trim() || !textContent.trim()}
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
            Add to Capsule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CapsuleUploader;
