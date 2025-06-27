import Capsule from '../models/Capsule.js';

// @desc    Create a new capsule
// @route   POST /api/capsules
// @access  Private
export const createCapsule = async (req, res) => {
  try {
    const { title, description, unlockDate, unsealingDate, isPublic, media } = req.body;
    const owner = req.user.id;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Handle both unlockDate (from frontend) and unsealingDate (model field)
    const finalUnsealingDate = unlockDate || unsealingDate;
    
    if (!finalUnsealingDate) {
      return res.status(400).json({ message: 'Unsealing date is required' });
    }

    const capsule = new Capsule({
      owner,
      title,
      description: description || '',
      unsealingDate: finalUnsealingDate,
      isPublic: Boolean(isPublic),
      status: 'unsealed',
      media: media || [], // Include media array from frontend
    });

    const createdCapsule = await capsule.save();
    
    res.status(201).json({
      success: true,
      message: 'Capsule created successfully',
      data: createdCapsule
    });
  } catch (error) {
    console.error('createCapsule error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add media to an unsealed capsule
// @route   PUT /api/capsules/:id/media
// @access  Private
export const addMediaToCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (capsule.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (capsule.status !== 'unsealed') {
      return res.status(400).json({ message: 'Capsule is sealed and cannot be modified' });
    }

    if (req.file) {
      capsule.media.push({
        url: req.file.path,
        type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        filename: req.file.filename,
      });
    }

    const updatedCapsule = await capsule.save();
    res.json(updatedCapsule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Seal a capsule
// @route   PUT /api/capsules/:id/seal
// @access  Private
export const sealCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (capsule.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    capsule.status = 'sealed';
    const updatedCapsule = await capsule.save();
    res.json(updatedCapsule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single capsule
// @route   GET /api/capsules/:id
// @access  Public/Private
export const getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id).populate('owner', 'name');

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check if capsule is sealed and unsealing date has passed
    const now = new Date();
    const unsealingDate = new Date(capsule.unsealingDate);

    if (capsule.status === 'sealed' && now < unsealingDate) {
        return res.status(403).json({ message: 'This capsule is not yet available to be opened.' });
    }

    // If the capsule should be unsealed, update its status
    if (capsule.status === 'sealed' && now >= unsealingDate) {
        capsule.status = 'unsealed';
        await capsule.save();
    }

    // Transform the capsule data to match frontend expectations
    const transformedCapsule = {
      _id: capsule._id,
      name: capsule.title, // Map title to name
      title: capsule.title,
      description: capsule.description,
      owner: capsule.owner,
      unlockDate: capsule.unsealingDate, // Map unsealingDate to unlockDate
      unsealingDate: capsule.unsealingDate,
      isPublic: capsule.isPublic,
      status: capsule.status,
      createdAt: capsule.createdAt,
      updatedAt: capsule.updatedAt,
      // Transform media array to memories array for frontend compatibility
      memories: capsule.media.map(mediaItem => ({
        _id: mediaItem._id,
        title: mediaItem.filename || 'Media Item',
        type: mediaItem.type,
        content: {
          fileUrl: mediaItem.url,
          fileName: mediaItem.filename,
          text: mediaItem.type === 'note' ? mediaItem.url : undefined
        },
        createdAt: capsule.createdAt // Use capsule creation date as fallback
      })),
      media: capsule.media // Keep original media array too
    };

    res.json({
      success: true,
      capsule: transformedCapsule
    });
  } catch (error) {
    console.error('getCapsuleById error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all capsules for the current user
// @route   GET /api/capsules/my-capsules
// @access  Private
export const getUserCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ owner: req.user.id })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    
    // Transform capsules to match frontend expectations
    const transformedCapsules = capsules.map(capsule => ({
      _id: capsule._id,
      name: capsule.title, // Map title to name
      title: capsule.title,
      description: capsule.description,
      owner: capsule.owner,
      unlockDate: capsule.unsealingDate, // Map unsealingDate to unlockDate
      unsealingDate: capsule.unsealingDate,
      isPublic: capsule.isPublic,
      status: capsule.status,
      createdAt: capsule.createdAt,
      updatedAt: capsule.updatedAt,
      // Transform media array to memories array for frontend compatibility
      memories: capsule.media.map(mediaItem => ({
        _id: mediaItem._id,
        title: mediaItem.filename || 'Media Item',
        type: mediaItem.type,
        content: {
          fileUrl: mediaItem.url,
          fileName: mediaItem.filename,
          text: mediaItem.type === 'note' ? mediaItem.url : undefined
        },
        createdAt: capsule.createdAt
      })),
      media: capsule.media
    }));
    
    res.json(transformedCapsules);
  } catch (error) {
    console.error('getUserCapsules error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public capsules
// @route   GET /api/capsules/explore
// @access  Public
export const getPublicCapsules = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query for public capsules
    let query = { isPublic: true };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const capsules = await Capsule.find(query)
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Capsule.countDocuments(query);

    // Transform capsules to match frontend expectations
    const transformedCapsules = capsules.map(capsule => ({
      _id: capsule._id,
      name: capsule.title,
      title: capsule.title,
      description: capsule.description,
      owner: capsule.owner,
      unlockDate: capsule.unsealingDate,
      unsealingDate: capsule.unsealingDate,
      isPublic: capsule.isPublic,
      status: capsule.status,
      createdAt: capsule.createdAt,
      updatedAt: capsule.updatedAt,
      media: capsule.media,
      mediaCount: capsule.media.length
    }));

    res.json({
      success: true,
      capsules: transformedCapsules,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        limit: limitNum,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('getPublicCapsules error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a capsule
// @route   DELETE /api/capsules/:id
// @access  Private
export const deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check if the user is the owner of the capsule
    if (capsule.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this capsule' });
    }

    // Delete the capsule
    await Capsule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Capsule deleted successfully'
    });
  } catch (error) {
    console.error('deleteCapsule error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
