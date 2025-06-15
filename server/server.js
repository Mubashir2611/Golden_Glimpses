import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import capsuleRoutes from './routes/capsules.js';
import memoryRoutes from './routes/memories.js';
import userRoutes from './routes/users.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { displayNetworkInfo } from './utils/network.js';

// Load environment variables
dotenv.config();

// Get directory name (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MERN Time Capsule API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      capsules: '/api/capsules',
      memories: '/api/memories',
      users: '/api/users',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB Atlas...');
    
    try {
      // Try to connect to MongoDB with timeout
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      global.mockDB = false;
      return conn;
    } catch (mongoError) {
      console.log('\n⚠️  MongoDB Atlas Connection Failed');
      console.log('📋 Error Details:', mongoError.message);
        if (mongoError.message.includes('IP') || mongoError.message.includes('whitelist')) {
        console.log('\n🔧 To fix MongoDB Atlas connection:');
        console.log('   1. Go to MongoDB Atlas Dashboard');
        console.log('   2. Navigate to Network Access');
        console.log('   3. Add your current IP address to the whitelist');
        console.log('   4. Or add 0.0.0.0/0 to allow all IPs (for development only)');
        console.log('   5. Save changes and wait 2-3 minutes for propagation\n');
        
        // Display current IP address
        await displayNetworkInfo();
      }
        console.log('🔄 Falling back to mock in-memory database for development...');
      console.log('✅ Mock database initialized - using in-memory data store\n');
      
      // Set up mock database flag and initialize arrays
      global.mockDB = true;
      global.mockUsers = global.mockUsers || [];
      global.mockCapsules = global.mockCapsules || [];
      global.mockMemories = global.mockMemories || [];
      
      return { connection: { host: 'mock-database' } };
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnection = await connectDB();
  
  app.listen(PORT, () => {
    const dbStatus = global.mockDB ? 'Mock Database (In-Memory)' : `MongoDB Atlas: ${dbConnection.connection.host}`;
    console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode
📡 Port: ${PORT}
🗄️  Database: ${dbStatus}
🌐 CORS Origins: ${corsOptions.origin.join(', ')}
⏰ Started at: ${new Date().toLocaleString()}
${global.mockDB ? '⚠️  Using mock database - data will not persist between restarts' : '✅ Connected to persistent MongoDB Atlas'}
    `);
  });
};

startServer().catch(console.error);

export default app;
