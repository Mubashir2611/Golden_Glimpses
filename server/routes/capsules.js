import express from 'express';
import multer from 'multer';
import { createCapsule, addMediaToCapsule, sealCapsule, getCapsuleById, getPublicCapsules, getUserCapsules, deleteCapsule } from '../controllers/capsuleController.js';
import { protect } from '../middleware/auth.js';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

// @route   POST /api/capsules
// @desc    Create a new capsule
// @access  Private
router.route('/').post(protect, createCapsule);

// @route   GET /api/capsules/my-capsules
// @desc    Get capsules created by the logged-in user
// @access  Private
router.route('/my-capsules').get(protect, getUserCapsules);

// @route   GET /api/capsules/public/explore
// @desc    Get public, unlocked capsules for exploration
// @access  Public
router.route('/explore').get(getPublicCapsules);

// @route   GET /api/capsules/:id
// @desc    Get single capsule by ID
// @access  Private
router.route('/:id').get(getCapsuleById).delete(protect, deleteCapsule);

// @route   PUT /api/capsules/:id/media
// @desc    Add media to an existing capsule
// @access  Private
router.route('/:id/media').put(protect, upload.single('image'), addMediaToCapsule);

// @route   PUT /api/capsules/:id/seal
// @desc    Seal a capsule (make it read-only)
// @access  Private
router.route('/:id/seal').put(protect, sealCapsule);

export default router;
