import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'; // Import at the top

const memorySchema = new mongoose.Schema({
  capsule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Capsule',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    text: {
      type: String,
      maxlength: [5000, 'Text content cannot exceed 5000 characters']
    },
    fileUrl: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number,
      min: 0
    },
    mimeType: {
      type: String,
      trim: true
    },
    duration: {
      type: Number, // For video/audio files (in seconds)
      min: 0
    },
    dimensions: {
      width: {
        type: Number,
        min: 0
      },
      height: {
        type: Number,
        min: 0
      }
    }
  },
  metadata: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      address: {
        type: String,
        trim: true
      }
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 20
    }],
    mood: {
      type: String,
      enum: ['happy', 'sad', 'excited', 'nostalgic', 'peaceful', 'energetic', 'contemplative'],
      default: null
    },
    weather: {
      type: String,
      trim: true
    },
    temperature: {
      type: Number
    }
  },
  privacy: {
    type: String,
    enum: ['private', 'capsule', 'public'],
    default: 'capsule' // private = only owner, capsule = capsule viewers, public = everyone
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reaction counts
memorySchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

// Virtual for total reactions
memorySchema.virtual('totalReactions').get(function() {
  return this.reactions.length;
});

// Virtual for comment count
memorySchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual to check if memory has content
memorySchema.virtual('hasContent').get(function() {
  return !!(this.content.text || this.content.fileUrl);
});

// Indexes for performance
memorySchema.index({ capsule: 1, createdAt: -1 });
memorySchema.index({ owner: 1, createdAt: -1 });
memorySchema.index({ type: 1 });
memorySchema.index({ 'metadata.tags': 1 });
memorySchema.index({ isDeleted: 1 });
// Note: 2dsphere index is already created by the schema field definition

// Pre-save middleware for validation
memorySchema.pre('save', function(next) {
  // Ensure at least text or file content exists
  if (!this.content.text && !this.content.fileUrl) {
    return next(new Error('Memory must have either text content or a file'));
  }

  // Set type based on content
  if (this.content.fileUrl && this.content.mimeType) {
    if (this.content.mimeType.startsWith('image/')) {
      this.type = 'image';
    } else if (this.content.mimeType.startsWith('video/')) {
      this.type = 'video';
    } else if (this.content.mimeType.startsWith('audio/')) {
      this.type = 'audio';
    } else {
      this.type = 'document';
    }
  } else if (this.content.text) {
    this.type = 'text';
  }

  next();
});

// Instance method to add reaction
memorySchema.methods.addReaction = function(userId, reactionType) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => !reaction.user.equals(userId)
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    type: reactionType
  });
  
  return this.save();
};

// Instance method to remove reaction
memorySchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    reaction => !reaction.user.equals(userId)
  );
  return this.save();
};

// Instance method to add comment
memorySchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text: text.trim()
  });
  return this.save();
};

// Instance method to soft delete
memorySchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to increment view count
memorySchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find by capsule (excluding deleted)
memorySchema.statics.findByCapsule = function(capsuleId, options = {}) {
  const { includeDeleted = false, page = 1, limit = 20, sort = 'createdAt' } = options;
  const skip = (page - 1) * limit;
  
  const query = { capsule: capsuleId };
  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('owner', 'name email avatar')
    .populate('comments.user', 'name avatar')
    .populate('reactions.user', 'name avatar');
};

// Static method to find by location
memorySchema.statics.findByLocation = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    'metadata.location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isDeleted: { $ne: true }
  });
};

// Pre-remove hook to delete file from Cloudinary if applicable
memorySchema.pre('remove', async function(next) {
  if (this.content && this.content.publicId && !this.content.publicId.startsWith('mock_')) {
    // Attempt to configure Cloudinary if not already configured and essential env vars are present
    // This is a fallback, ideal configuration is at app startup.
    if (!cloudinary.config().cloud_name && process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }
      
    if (!cloudinary.config().cloud_name) {
      console.warn(`Cloudinary not configured. Skipping deletion of '${this.content.publicId}'. Ensure Cloudinary is configured at application startup.`);
      return next(); // Important to return here if not configured
    }

    try {
      console.log(`Attempting to delete '${this.content.publicId}' (type: '${this.type}') from Cloudinary.`);
      
      let resourceType = 'image'; // Default
      if (this.type === 'video') resourceType = 'video';
      else if (this.type === 'audio') resourceType = 'video'; // Cloudinary API uses 'video' for audio resource_type
      else if (this.type === 'document') resourceType = 'raw'; // Documents are often 'raw'

      await cloudinary.uploader.destroy(this.content.publicId, { resource_type: resourceType });
      console.log(`Successfully deleted '${this.content.publicId}' from Cloudinary.`);
      next();
    } catch (err) {
      console.error(`Failed to delete '${this.content.publicId}' from Cloudinary:`, err);
      // Proceed with DB deletion even if Cloudinary fails, to prevent orphaned DB entries.
      // To halt DB deletion on Cloudinary error, call next(err);
      next(); 
    }
  } else {
    if (this.content && this.content.publicId && this.content.publicId.startsWith('mock_')) {
      console.log(`Skipping Cloudinary deletion for mock publicId '${this.content.publicId}'.`);
    }
    next();
  }
});

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
