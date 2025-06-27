import express from 'express';
import User from '../models/User.js';
import { protect as auth } from '../middleware/auth.js';

// Mock database for users
const getMockUsers = () => {
  try {
    return global.mockUsers || [];
  } catch (e) {
    return [];
  }
};

const router = express.Router();

// @route   GET /api/users/test
// @desc    Test endpoint
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Users route is working!',
    timestamp: new Date().toISOString()
  });
});

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
    const { name, bio, location } = req.body;
    
    // Basic validation
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return res.status(400).json({
        success: false,
        msg: 'Name must be between 2 and 50 characters'
      });
    }

    if (bio && bio.trim().length > 500) {
      return res.status(400).json({
        success: false,
        msg: 'Bio cannot exceed 500 characters'
      });
    }

    if (location && location.trim().length > 100) {
      return res.status(400).json({
        success: false,
        msg: 'Location cannot exceed 100 characters'
      });
    }
    
    if (global.mockDB) {
      // Mock database flow
      const mockUsers = getMockUsers();
      const userIndex = mockUsers.findIndex(u => u._id === req.userId);
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          msg: 'User not found'
        });
      }

      // Update user fields
      if (name !== undefined) mockUsers[userIndex].name = name.trim();
      if (bio !== undefined) mockUsers[userIndex].bio = bio.trim();
      if (location !== undefined) mockUsers[userIndex].location = location.trim();
      
      // Update global mock users
      global.mockUsers = mockUsers;

      // Return updated user without password
      const { password, ...userProfile } = mockUsers[userIndex];
      return res.json({
        success: true,
        msg: 'Profile updated successfully',
        user: userProfile
      });
    }
    
    // MongoDB flow
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: userObject
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating profile'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    if (global.mockDB) {
      // Mock database flow
      const mockUsers = getMockUsers();
      const userIndex = mockUsers.findIndex(u => u._id === req.userId);
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          msg: 'User not found'
        });
      }

      // Remove user from mock database
      mockUsers.splice(userIndex, 1);
      global.mockUsers = mockUsers;

      return res.json({
        success: true,
        msg: 'Account deleted successfully'
      });
    }

    // MongoDB flow
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.userId);

    res.json({
      success: true,
      msg: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while deleting account'
    });
  }
});

export default router;
