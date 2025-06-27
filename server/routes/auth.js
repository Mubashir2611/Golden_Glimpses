import express from 'express';
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken'; // jwt is now used via helpers from middleware
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  protect as auth, 
  generateToken, 
  generateRefreshToken 
} from '../middleware/auth.js';

const router = express.Router();

// JWT_SECRET is handled within the auth middleware now. No need for it here.
// const JWT_SECRET = process.env.JWT_SECRET || '2242cdc4d9fbd0b0290a48ebe75bfe679bd48ad2491aec7e02495336aef99a61';

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
      
      // Generate tokens using helpers
      const accessToken = generateToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);

      return res.status(201).json({
        success: true,
        msg: 'User registered successfully',
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      });    }
    
    // MongoDB flow
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
    });    await user.save();

    // Generate tokens using helpers
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      accessToken,
      refreshToken,
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
      console.log('Looking for user with email:', email.toLowerCase());
      console.log('Available users:', mockUsers.map(u => ({ email: u.email, id: u._id })));
      
      const user = mockUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        console.log('User not found in mock DB');
        return res.status(400).json({
          success: false,
          msg: 'Invalid email or password'
        });
      }

      console.log('User found, checking password...');
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          msg: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      
      // Generate tokens using helpers
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      return res.json({
        success: true,
        msg: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lastLogin: user.lastLogin
        }
      });    }
    
    // MongoDB flow
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }    // Check password using model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens using helpers
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      msg: 'Login successful',
      accessToken,
      refreshToken,
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
      });    }

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

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (requires valid refresh token)
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, msg: 'Refresh token is required' });
  }

  try {
    // JWT_SECRET for verification is implicitly handled by jwt.verify if process.env.JWT_SECRET is set,
    // or falls back to the one defined in middleware/auth.js if that's where generateRefreshToken gets it.
    // It's better if JWT_SECRET is consistently used. The one in middleware/auth.js is preferred.
    const jwtModule = await import('jsonwebtoken'); // Dynamically import jsonwebtoken
    const { default: jwt } = jwtModule;
    
    // Need to access the JWT_SECRET used by generateRefreshToken, which is from middleware/auth.js
    // This is a bit tricky as it's not directly exported. For now, we'll assume process.env.JWT_SECRET is primary.
    // A better solution would be a shared config or ensuring JWT_SECRET is consistently loaded.
    const secret = process.env.JWT_SECRET || '2242cdc4d9fbd0b0290a48ebe75bfe679bd48ad2491aec7e02495336aef99a61';


    const decoded = jwt.verify(refreshToken, secret);

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ success: false, msg: 'Invalid token type for refresh' });
    }

    // Token is valid and is a refresh token, issue a new access token
    const newAccessToken = generateToken(decoded.userId);

    res.json({
      success: true,
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, msg: 'Refresh token expired, please log in again' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, msg: 'Invalid refresh token' });
    }
    return res.status(500).json({ success: false, msg: 'Could not refresh token' });
  }
});


export default router;
