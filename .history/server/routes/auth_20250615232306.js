import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get mock users
const getMockUsers = () => {
  return global.mockUsers || [];
};

// Helper function to add user to mock database
const addMockUser = (user) => {
  const mockUsers = getMockUsers();
  mockUsers.push(user);
  global.mockUsers = mockUsers;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get the first error message for a cleaner user experience
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        msg: firstError.msg,
        errors: errors.array()
      });
    }const { name, email, password } = req.body;    // Check if we're using mock database
    if (global.mockDB) {
      // Check for existing user in mock DB
      const mockUsers = getMockUsers();
      const existingUser = mockUsers.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          msg: 'User already exists with this email address'
        });
      }

      // Hash password for mock database (since we don't have pre-save hooks there)
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create mock user
      const newUser = {
        _id: uuidv4(),
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        isActive: true,
        createdAt: new Date()
      };

      // Add to mock database
      addMockUser(newUser);

      // Create JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        msg: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      });
    }
      // Regular MongoDB flow
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists with this email address'
      });
    }

    // Create new user - password will be hashed automatically by the User model pre-save hook
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password // No manual hashing - let the model handle it
    });

    await user.save();

    // Create JWT token
    const payload = {
      userId: user._id,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get the first error message for a cleaner user experience
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        msg: firstError.msg,
        errors: errors.array()
      });
    }    const { email, password } = req.body;    // Check if we're using mock database
    if (global.mockDB) {
      // Find user in mock DB
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(400).json({
          success: false,
          msg: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          msg: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        msg: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lastLogin: user.lastLogin
        }
      });
    }    // Regular MongoDB flow
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT token
    const payload = {
      userId: user._id,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      msg: 'Token is not valid'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
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

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

export default router;
