const crypto = require('crypto');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const Guide = require('../models/Guides');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── Helper: parse features safely (handles both string and array) ───
const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    return features.split(',').map(f => f.trim()).filter(Boolean);
  }
  return [];
};

// ─── PUBLIC: get all guides ───
exports.getGuides = asyncHandler(async (req, res) => {
  const guides = await Guide.find().sort({ createdAt: -1 });
  res.json(guides);
});

// ─── PUBLIC: get single guide by id ───
exports.getGuideById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const guide = await Guide.findOne({ id });
  if (!guide) {
    throw new AppError('Guide not found', 404);
  }
  res.json(guide);
});

// ─── PROTECTED: add a new guide ───
exports.addGuide = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, description, features } = req.body;
  const imageFile = req.file;

  if (!title || !description) {
    throw new AppError('Title and description are required', 400);
  }

  // ── Upload image to Cloudinary if provided ──
  let imageUrl = '';
  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile.buffer, 'renty/guides');
  }

  // ── Parse features safely ──
  const featuresArray = parseFeatures(features);

  const newGuide = new Guide({
    id: crypto.randomUUID(),
    userId,
    title,
    description,
    features: featuresArray,
    image: imageUrl,
  });

  await newGuide.save();
  res.status(201).json(newGuide);
});

// ─── PROTECTED: update a guide ───
exports.updateGuide = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const guideId = req.params.id;
  const { title, description, features } = req.body;
  const imageFile = req.file;

  const guide = await Guide.findOne({ id: guideId, userId });
  if (!guide) {
    throw new AppError('Guide not found or unauthorized', 404);
  }

  if (title) guide.title = title;
  if (description) guide.description = description;

  if (features !== undefined) {
    guide.features = parseFeatures(features);
  }

  // ── If a new image is uploaded, upload to Cloudinary ──
  if (imageFile) {
    guide.image = await uploadToCloudinary(imageFile.buffer, 'renty/guides');
  }

  await guide.save();
  res.json(guide);
});

// ─── PROTECTED: delete a guide ───
exports.deleteGuide = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const guideId = req.params.id;

  const result = await Guide.deleteOne({ id: guideId, userId });
  if (result.deletedCount === 0) {
    throw new AppError('Guide not found or unauthorized', 404);
  }
  res.json({ message: 'Guide deleted successfully' });
});