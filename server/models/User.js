import express from 'express';
import User from '../models/User.js';
import { authenticateToken as auth } from '../middleware/auth.js';

// Mock database for users
const getMockUsers = () => {
  try {
    return global.mockUsers || [];
  } catch (e) {
    return [];
  }
};

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u._id === req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'User not found'
        });
      }

      // Return user without password
      const { password, ...userProfile } = user;
      return res.json({
        success: true,
        user: userProfile
      });
    }

    // MongoDB flow
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    if (name) user.name = name.trim();
    
    await user.save();

    res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating profile'
    });
  }
});

export default router;