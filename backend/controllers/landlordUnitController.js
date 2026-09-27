const crypto = require('crypto');
const Unit = require('../models/Unit');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// Read the allowed house types from the model so they can never drift out of sync
const HOUSE_TYPES = Unit.schema.path('houseType').enumValues;

const uploadImages = (files = []) =>
  Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'rentals/units')));

const parseMoney = (value, { min, label }) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min) throw new AppError(`${label} is invalid`, 400);
  return n;
};

// ─── PROTECTED: the logged-in landlord's own units ───
exports.getMyUnits = asyncHandler(async (req, res) => {
  const units = await Unit.find({ userId: req.user.id })
    .select('-clientId -__v')
    .sort({ createdAt: -1 })
    .lean();
  res.json(units);
});

// ─── PROTECTED: add a unit ───
exports.addUnit = asyncHandler(async (req, res) => {
  const { houseType, rent, deposit, location, description } = req.body;

  if (!HOUSE_TYPES.includes(houseType)) throw new AppError('Invalid house type', 400);
  const rentNumber = parseMoney(rent, { min: 1, label: 'Rent' });
  const depositNumber = parseMoney(deposit || 0, { min: 0, label: 'Deposit' });
  if (!location || !location.trim()) throw new AppError('Location is required', 400);

  const images = await uploadImages(req.files);

  const unit = await Unit.create({
    id: crypto.randomUUID(),
    userId: req.user.id, // always from the token, never from the body
    houseType,
    rent: rentNumber,
    deposit: depositNumber,
    location: location.trim(),
    description: description || '',
    images,
  });

  res.status(201).json(unit);
});

// ─── PROTECTED: update one of the landlord's own units ───
exports.updateUnit = asyncHandler(async (req, res) => {
  const { houseType, rent, deposit, location, description } = req.body;

  const unit = await Unit.findOne({ id: req.params.id, userId: req.user.id });
  if (!unit) throw new AppError('Unit not found or unauthorized', 404);

  if (houseType !== undefined) {
    if (!HOUSE_TYPES.includes(houseType)) throw new AppError('Invalid house type', 400);
    unit.houseType = houseType;
  }
  if (rent !== undefined) unit.rent = parseMoney(rent, { min: 1, label: 'Rent' });
  if (deposit !== undefined) unit.deposit = parseMoney(deposit || 0, { min: 0, label: 'Deposit' });
  if (location !== undefined) {
    if (!location.trim()) throw new AppError('Location is required', 400);
    unit.location = location.trim();
  }
  if (description !== undefined) unit.description = description;

  // New images replace the old set; no new files keeps the current ones
  if (req.files?.length) unit.images = await uploadImages(req.files);

  await unit.save();
  res.json(unit);
});

// ─── PROTECTED: delete one of the landlord's own units (vacant only) ───
exports.deleteUnit = asyncHandler(async (req, res) => {
  const filter = { id: req.params.id, userId: req.user.id };

  // Atomic: only deletes if the unit is still vacant at that moment
  const result = await Unit.deleteOne({ ...filter, status: 'vacant' });
  if (result.deletedCount === 0) {
    const exists = await Unit.exists(filter);
    throw exists
      ? new AppError('Cannot delete a unit that is reserved or occupied', 409)
      : new AppError('Unit not found or unauthorized', 404);
  }

  res.json({ message: 'Unit deleted successfully' });
});