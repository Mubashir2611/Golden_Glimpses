import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken as auth } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get directory name (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
});

// @route   POST /api/media/upload
// @desc    Upload media file to Cloudinary
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('Media upload request received');
    console.log('User ID:', req.userId);
    console.log('File:', req.file ? req.file.originalname : 'No file');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;    if (!isCloudinaryConfigured) {
      // Mock upload for development - save file locally
      console.log('Using mock upload - Cloudinary not configured');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = req.file.mimetype.split('/')[1];
      const fileName = `mock_${timestamp}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file to local uploads directory
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Create URL that points to our local static file server
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const mockUrl = `${baseUrl}/uploads/${fileName}`;
      
      console.log('File saved locally:', filePath);
      console.log('Mock URL:', mockUrl);
      
      return res.json({
        success: true,
        message: 'File uploaded successfully (mock)',
        url: mockUrl,
        publicId: `mock_${timestamp}`,
        format: fileExtension,
        resourceType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
        bytes: req.file.size
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'time-capsule-media',
          resource_type: 'auto', // Automatically detect file type
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      bytes: uploadResult.bytes
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/media/:publicId
// @desc    Delete media file from Cloudinary
// @access  Private
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

// @route   GET /api/media/test
// @desc    Test media upload authentication
// @access  Private
router.get('/test', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    userId: req.userId,
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    } : null
  });
});

export default router;
