import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardMedia,
  Alert,
  Button
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaAPI } from '../utils/api';

const MediaUploader = ({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi']
  }
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(file => {
        const error = file.errors[0];
        return `${file.file.name}: ${error.message}`;
      });
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
        
        return {
          id,
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded: false,
          cloudinaryUrl: null,
          error: null
        };
      });

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: uploading
  });
  const uploadToCloudinary = async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);

    try {
      const response = await mediaAPI.uploadFile(formData);
      return response.data.url;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    setErrors([]);

    const uploadPromises = files
      .filter(f => !f.uploaded)
      .map(async (fileData) => {
        try {
          const cloudinaryUrl = await uploadToCloudinary(fileData);
          
          return {
            ...fileData,
            uploaded: true,
            cloudinaryUrl,
            error: null
          };        } catch (err) {
          return {
            ...fileData,
            error: err.message
          };
        }
      });

    try {
      const results = await Promise.all(uploadPromises);
      
      const updatedFiles = files.map(file => {
        const result = results.find(r => r.id === file.id);
        return result || file;
      });

      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      
      const failedUploads = results.filter(r => r.error);
      if (failedUploads.length > 0) {
        setErrors(failedUploads.map(f => `${f.name}: ${f.error}`));
      }    } catch {
      setErrors(['Upload failed. Please try again.']);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Clean up preview URL
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.startsWith('video/')) return <VideoIcon />;
    return <CloudUploadIcon />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Error Display */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={clearErrors}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="body2">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </Typography>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
          borderRadius: 3,
          backgroundColor: isDragActive 
            ? 'rgba(99, 102, 241, 0.1)' 
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
          }
        }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 64, 
              color: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
            {isDragActive ? 'Drop your media here!' : 'Drag & drop your photos and videos'}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            or click to browse your files
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Max ${maxFiles} files`} 
              size="small" 
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
            <Chip 
              label={`Up to ${formatFileSize(maxSize)}`} 
              size="small" 
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
            <Chip 
              label="Images & Videos" 
              size="small" 
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
          </Box>
        </motion.div>
      </Paper>

      {/* File Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Selected Media ({files.length}/{maxFiles})
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {files.map((fileData) => (
                  <Grid item xs={12} sm={6} md={4} key={fileData.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Card
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {/* Media Preview */}
                        {fileData.preview ? (
                          <CardMedia
                            component="img"
                            height="150"
                            image={fileData.preview}
                            alt={fileData.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 150,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {getFileIcon(fileData.type)}
                          </Box>
                        )}

                        {/* File Info Overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            p: 1,
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'white', 
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {fileData.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {formatFileSize(fileData.size)}
                          </Typography>
                        </Box>

                        {/* Status Indicators */}
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          {fileData.uploaded && (
                            <Chip 
                              label="Uploaded" 
                              size="small" 
                              color="success"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                          {fileData.error && (
                            <Chip 
                              label="Error" 
                              size="small" 
                              color="error"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                        </Box>

                        {/* Remove Button */}
                        <IconButton
                          onClick={() => removeFile(fileData.id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 0, 0, 0.6)',
                            },
                            width: 32,
                            height: 32,
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        {/* Upload Progress */}
                        {uploadProgress[fileData.id] && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                            }}
                          >
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress[fileData.id]}
                              sx={{
                                height: 4,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: 'primary.main',
                                },
                              }}
                            />
                          </Box>
                        )}
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Upload Button */}
              {files.some(f => !f.uploaded) && (
                <Button
                  variant="contained"
                  onClick={uploadAllFiles}
                  disabled={uploading}
                  startIcon={<CloudUploadIcon />}
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
                  {uploading ? 'Uploading...' : `Upload ${files.filter(f => !f.uploaded).length} Files`}
                </Button>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default MediaUploader;
