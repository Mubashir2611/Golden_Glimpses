import express from 'express';
import { body, validationResult } from 'express-validator';
import Capsule from '../models/Capsule.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

// Mock database for capsules
const getMockCapsules = () => {
  try {
    return global.mockCapsules || [];
  } catch (e) {
    return [];
  }
};

const router = express.Router();

// @route   GET /api/capsules/public
// @desc    Get public capsules for explore page
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    
    if (global.mockDB) {
      // Mock database flow
      const mockCapsules = getMockCapsules();
      const publicCapsules = mockCapsules.filter(capsule => 
        capsule.isPublic && 
        (search === '' || 
         capsule.name.toLowerCase().includes(search.toLowerCase()) ||
         capsule.description.toLowerCase().includes(search.toLowerCase())
        )
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCapsules = publicCapsules.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        capsules: paginatedCapsules,
        pagination: {
          page,
          limit,
          total: publicCapsules.length,
          pages: Math.ceil(publicCapsules.length / limit)
        }
      });
    }

    // MongoDB flow
    const skip = (page - 1) * limit;
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    } : {};

    const query = {
      isPublic: true,
      unlocked: true, // Only show unlocked public capsules
      ...searchQuery
    };

    const capsules = await Capsule.find(query)
      .populate('owner', 'name email')
      .populate('memories')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Capsule.countDocuments(query);

    res.json({
      success: true,
      capsules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public capsules:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching public capsules'
    });
  }
});

// @route   GET /api/capsules
// @desc    Get all capsules for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockCapsules = getMockCapsules();
      const userCapsules = mockCapsules.filter(capsule => capsule.owner === req.userId);
      
      // Check which capsules should be unlocked
      const now = new Date();
      const updatedCapsules = userCapsules.map(capsule => {
        if (!capsule.unlocked && new Date(capsule.unlockDate) <= now) {
          capsule.unlocked = true;
        }
        return capsule;
      });

      return res.json({
        success: true,
        count: updatedCapsules.length,
        capsules: updatedCapsules
      });
    }

    // MongoDB flow
    const capsules = await Capsule.find({ owner: req.userId })
      .populate('memories')
      .sort({ createdAt: -1 });

    // Check which capsules should be unlocked
    const now = new Date();
    const updatedCapsules = capsules.map(capsule => {
      if (!capsule.unlocked && new Date(capsule.unlockDate) <= now) {
        capsule.unlocked = true;
        capsule.save();
      }
      return capsule;
    });

    res.json({
      success: true,
      count: updatedCapsules.length,
      capsules: updatedCapsules
    });
  } catch (error) {
    console.error('Error fetching capsules:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching capsules'
    });
  }
});

// @route   GET /api/capsules/:id
// @desc    Get single capsule by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockCapsules = getMockCapsules();
      const capsule = mockCapsules.find(c => c._id === req.params.id && c.owner === req.userId);

      if (!capsule) {
        return res.status(404).json({
          success: false,
          msg: 'Capsule not found'
        });
      }

      // Check if capsule should be unlocked
      const now = new Date();
      if (!capsule.unlocked && new Date(capsule.unlockDate) <= now) {
        capsule.unlocked = true;
      }

      return res.json({
        success: true,
        capsule
      });
    }

    // MongoDB flow
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      owner: req.userId
    }).populate('memories');

    if (!capsule) {
      return res.status(404).json({
        success: false,
        msg: 'Capsule not found'
      });
    }

    // Check if capsule should be unlocked
    const now = new Date();
    if (!capsule.unlocked && new Date(capsule.unlockDate) <= now) {
      capsule.unlocked = true;
      await capsule.save();
    }

    res.json({
      success: true,
      capsule
    });
  } catch (error) {
    console.error('Error fetching capsule:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching capsule'
    });
  }
});

// @route   POST /api/capsules
// @desc    Create a new capsule
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('unlockDate')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Unlock date must be in the future');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      name, 
      description, 
      unlockDate, 
      mediaUrls = [], 
      tags = [], 
      theme = 'default',
      isPublic = false 
    } = req.body;

    if (global.mockDB) {
      // Mock database flow
      const newCapsule = {
        _id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        unlockDate: new Date(unlockDate),
        owner: req.userId,
        unlocked: false,
        mediaUrls,
        tags,
        theme,
        isPublic,
        memoryCount: mediaUrls.length,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        memories: mediaUrls.map(media => ({
          _id: uuidv4(),
          type: media.type.startsWith('image/') ? 'image' : 'video',
          content: {
            fileUrl: media.url,
            fileName: media.name,
            fileSize: media.size,
            mimeType: media.type
          },
          createdAt: new Date()
        }))
      };

      const mockCapsules = getMockCapsules();
      mockCapsules.push(newCapsule);
      global.mockCapsules = mockCapsules;

      return res.status(201).json({
        success: true,
        msg: 'Time capsule created successfully',
        capsule: newCapsule
      });
    }

    // MongoDB flow
    const capsule = new Capsule({
      name: name.trim(),
      description: description.trim(),
      unlockDate: new Date(unlockDate),
      owner: req.userId,
      tags,
      theme,
      isPublic
    });

    await capsule.save();

    // Create memory entries for each media file
    if (mediaUrls.length > 0) {
      const Memory = (await import('../models/Memory.js')).default;
      
      const memoryPromises = mediaUrls.map(media => {
        const memory = new Memory({
          capsule: capsule._id,
          owner: req.userId,
          type: media.type.startsWith('image/') ? 'image' : 'video',
          content: {
            fileUrl: media.url,
            fileName: media.name,
            fileSize: media.size,
            mimeType: media.type
          }
        });
        return memory.save();
      });

      await Promise.all(memoryPromises);
    }

    // Populate the capsule with memories
    await capsule.populate('memories');    res.status(201).json({
      success: true,
      msg: 'Time capsule created successfully',
      capsule
    });
  } catch (error) {
    console.error('Error creating capsule:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while creating capsule'
    });
  }
});

// @route   PUT /api/capsules/:id
// @desc    Update a time capsule (only if not unlocked)
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('unlockDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Unlock date must be in the future');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      });
    }

    const capsule = await Capsule.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        msg: 'Capsule not found'
      });
    }

    if (capsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        msg: 'Cannot modify an unlocked capsule'
      });
    }

    const { title, message, unlockDate } = req.body;
    
    if (title) capsule.title = title.trim();
    if (message) capsule.message = message.trim();
    if (unlockDate) capsule.unlockDate = new Date(unlockDate);

    await capsule.save();

    res.json({
      success: true,
      msg: 'Capsule updated successfully',
      capsule
    });
  } catch (error) {
    console.error('Error updating capsule:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating capsule'
    });
  }
});

// @route   DELETE /api/capsules/:id
// @desc    Delete a time capsule
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockCapsules = getMockCapsules();
      const capsuleIndex = mockCapsules.findIndex(c => c._id === req.params.id && c.owner === req.userId);

      if (capsuleIndex === -1) {
        return res.status(404).json({
          success: false,
          msg: 'Capsule not found'
        });
      }

      // Remove the capsule from mock database
      mockCapsules.splice(capsuleIndex, 1);
      global.mockCapsules = mockCapsules;

      return res.json({
        success: true,
        msg: 'Capsule deleted successfully'
      });
    }

    // MongoDB flow
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        msg: 'Capsule not found'
      });
    }

    await Capsule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: 'Capsule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting capsule:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while deleting capsule'
    });
  }
});

export default router;
