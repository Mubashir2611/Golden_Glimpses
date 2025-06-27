import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Capsule title is required.'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters.'],
  },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video', 'audio', 'note'], required: true },
      filename: { type: String },
    },
  ],
  status: {
    type: String,
    enum: ['unsealed', 'sealed', 'locked'],
    default: 'unsealed',
  },
  unsealingDate: {
    type: Date,
    required: [true, 'An unsealing date is required.'],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Capsule', capsuleSchema);
