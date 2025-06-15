import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Capsule name is required'],
    trim: true,
    minlength: [2, 'Capsule name must be at least 2 characters long'],
    maxlength: [100, 'Capsule name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unlockDate: {
    type: Date,
    required: [true, 'Unlock date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Unlock date must be in the future'
    }
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  theme: {
    type: String,
    enum: ['default', 'vintage', 'modern', 'nature', 'space'],
    default: 'default'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for memories
capsuleSchema.virtual('memories', {
  ref: 'Memory',
  localField: '_id',
  foreignField: 'capsule'
});

// Virtual for memory count
capsuleSchema.virtual('memoryCount', {
  ref: 'Memory',
  localField: '_id',
  foreignField: 'capsule',
  count: true
});

// Virtual to check if capsule should be unlocked
capsuleSchema.virtual('shouldBeUnlocked').get(function() {
  return new Date() >= this.unlockDate && !this.unlocked;
});

// Virtual for time remaining
capsuleSchema.virtual('timeRemaining').get(function() {
  if (this.unlocked) return 0;
  const now = new Date();
  const unlock = new Date(this.unlockDate);
  return Math.max(0, unlock - now);
});

// Virtual for unlock progress (0-100)
capsuleSchema.virtual('unlockProgress').get(function() {
  if (this.unlocked) return 100;
  
  const now = new Date();
  const created = new Date(this.createdAt);
  const unlock = new Date(this.unlockDate);
  
  const total = unlock - created;
  const elapsed = now - created;
  
  return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
});

// Indexes for performance
capsuleSchema.index({ owner: 1, createdAt: -1 });
capsuleSchema.index({ unlockDate: 1, unlocked: 1 });
capsuleSchema.index({ unlocked: 1, isPublic: 1 });
capsuleSchema.index({ tags: 1 });

// Pre-save middleware to auto-unlock capsules
capsuleSchema.pre('save', function(next) {
  if (this.shouldBeUnlocked && !this.unlocked) {
    this.unlocked = true;
    this.unlockedAt = new Date();
  }
  next();
});

// Instance method to unlock capsule
capsuleSchema.methods.unlock = function() {
  if (!this.unlocked && new Date() >= this.unlockDate) {
    this.unlocked = true;
    this.unlockedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to increment view count
capsuleSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find unlockable capsules
capsuleSchema.statics.findUnlockable = function() {
  return this.find({
    unlockDate: { $lte: new Date() },
    unlocked: false
  });
};

// Static method to find by owner
capsuleSchema.statics.findByOwner = function(ownerId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ owner: ownerId })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('owner', 'name email')
    .populate('memoryCount');
};

// Static method to auto-unlock expired capsules
capsuleSchema.statics.autoUnlockExpired = async function() {
  const expiredCapsules = await this.findUnlockable();
  const unlockPromises = expiredCapsules.map(capsule => capsule.unlock());
  return Promise.all(unlockPromises);
};

const Capsule = mongoose.model('Capsule', capsuleSchema);

export default Capsule;
