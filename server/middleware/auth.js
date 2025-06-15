import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getMockUsers = () => {
  try {
    return global.mockUsers || [];
  } catch (e) {
    return [];
  }
};

// Main authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please log in again'
        });
      } else {
        throw tokenError;
      }
    }
    
    if (global.mockDB) {
      const mockUsers = getMockUsers();
      const mockUser = mockUsers.find(u => u._id === decoded.userId);
      
      if (!mockUser) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (!mockUser.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }
      
      req.user = mockUser;
      req.userId = mockUser._id;
      return next();
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    req.user = user;
    req.userId = user._id; 
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};


const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    req.user = user && user.isActive ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'time-capsule-app'
    }
  );
};


const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { 
      expiresIn: '90d',
      issuer: 'time-capsule-app'
    }
  );
};

export default authenticateToken;
export { authenticateToken, optionalAuth, generateToken, generateRefreshToken };
