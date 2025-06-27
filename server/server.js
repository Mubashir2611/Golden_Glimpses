import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Import routes
import authRoutes from './routes/auth.js';
import capsuleRoutes from './routes/capsules.js';
import mediaRoutes from './routes/media.js';
import userRoutes from './routes/users.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Get directory name (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);

// Not Found and Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
