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

router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
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

    const { title, message, unlockDate } = req.body;

    if (global.mockDB) {
      // Mock database flow
      const newCapsule = {
        _id: uuidv4(),
        title: title.trim(),
        message: message.trim(),
        unlockDate: new Date(unlockDate),
        owner: req.userId,
        unlocked: false,
        memories: [],
        createdAt: new Date(),
        updatedAt: new Date()
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
      title: title.trim(),
      message: message.trim(),
      unlockDate: new Date(unlockDate),
      owner: req.userId
    });

    await capsule.save();

    res.status(201).json({
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
