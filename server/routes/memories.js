import express from 'express';
import Memory from '../models/Memory.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Mock database for memories
const getMockMemories = () => {
  try {
    return global.mockMemories || [];
  } catch (e) {
    return [];
  }
};

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf,audio/mp3,audio/wav').split(',');
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: ' + allowedTypes.join(', ')));
    }
  },
});

const router = express.Router();

// @route   GET /api/memories
// @desc    Get all memories for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockMemories = getMockMemories();
      const userMemories = mockMemories.filter(memory => memory.owner === req.userId);
      
      return res.json({
        success: true,
        count: userMemories.length,
        memories: userMemories
      });
    }

    // MongoDB flow
    const memories = await Memory.find({ owner: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: memories.length,
      memories
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching memories'
    });
  }
});

// @route   POST /api/memories
// @desc    Create a new memory
// @access  Private
router.post('/', [auth, upload.single('file')], async (req, res) => {
  try {
    console.log('Creating memory with data:', req.body);
    console.log('File received:', req.file);
    
    const { text, capsuleId } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({
        success: false,
        msg: 'Either text or file is required'
      });
    }

    if (!capsuleId) {
      return res.status(400).json({
        success: false,
        msg: 'Capsule ID is required'
      });
    }

    // Mock database flow
    if (!global.mongoConnected) {
      const mockMemories = getMockMemories();
      
      const newMemory = {
        _id: uuidv4(),
        capsule: capsuleId,
        owner: req.userId,
        type: file ? (file.mimetype.startsWith('image/') ? 'image' : 'document') : 'text',
        content: file ? {
          fileUrl: `/uploads/${file.filename}`,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size
        } : { text },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockMemories.push(newMemory);
      global.mockMemories = mockMemories;

      console.log('Memory created in mock database:', newMemory);
      
      return res.status(201).json({
        success: true,
        msg: 'Memory created successfully',
        memory: newMemory
      });
    }

    // MongoDB flow
    const memory = new Memory({
      type: file ? (file.mimetype.startsWith('image/') ? 'image' : 'document') : 'text',
      content: file ? {
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size
      } : { text },
      capsule: capsuleId,
      owner: req.userId
    });

    await memory.save();

    res.status(201).json({
      success: true,
      msg: 'Memory created successfully',
      memory
    });
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error while creating memory'
    });
  }
});

// @route   POST /api/memories/:id
// @desc    Create a new memory for a specific capsule
// @access  Private
router.post('/:id', [auth, upload.single('file')], async (req, res) => {
  try {
    console.log('Creating memory for capsule:', req.params.id);
    console.log('Request body:', req.body);
    console.log('File received:', req.file);
    
    const capsuleId = req.params.id;
    const { text } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({
        success: false,
        msg: 'Either text or file is required'
      });
    }

    // Mock database flow
    if (!global.mongoConnected) {
      const mockMemories = getMockMemories();
      
      const newMemory = {
        _id: uuidv4(),
        capsule: capsuleId,
        owner: req.userId,
        type: file ? (file.mimetype.startsWith('image/') ? 'image' : 'document') : 'text',
        content: file ? {
          fileUrl: `/uploads/${file.filename}`,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size
        } : { text },
        text: text || '',
        file: file ? file.filename : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockMemories.push(newMemory);
      global.mockMemories = mockMemories;

      console.log('Memory created in mock database:', newMemory);
      
      return res.status(201).json({
        success: true,
        msg: 'Memory created successfully',
        memory: newMemory
      });
    }

    // MongoDB flow
    const memory = new Memory({
      type: file ? (file.mimetype.startsWith('image/') ? 'image' : 'document') : 'text',
      content: file ? {
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        text: text || ''
      } : { text },
      capsule: capsuleId,
      owner: req.userId
    });

    await memory.save();

    res.status(201).json({
      success: true,
      msg: 'Memory created successfully',
      memory
    });
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({
      success: false,
      msg: error.message || 'Server error while creating memory'
    });
  }
});

export default router;
