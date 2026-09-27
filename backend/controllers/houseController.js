const crypto = require('crypto');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const Unit = require('../models/Unit');
const Landlord = require('../models/Landlord');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── PUBLIC: search one house by location + budget ───
// Used by House.jsx
exports.searchHouse = asyncHandler(async (req, res) => {
  const { location, budget } = req.query;

  if (!location || !budget) {
    throw new AppError('Location and budget are required', 400);
  }

  const rent = Number(budget);
  if (Number.isNaN(rent)) {
    throw new AppError('Budget must be a number', 400);
  }

  // Find one vacant unit matching the location (case-insensitive) and within budget
  const unit = await Unit.findOne({
    location: { $regex: new RegExp(location, 'i') },
    rent: { $lte: rent },
    status: 'vacant',
  }).lean();

  if (!unit) {
    throw new AppError('No house found for that location and budget.', 404);
  }

  // Find the landlord of that unit
  const landlord = await Landlord.findOne({ userId: unit.userId }).lean();

  res.json({
    _id: unit._id,
    houseType: unit.houseType,
    rent: unit.rent,
    deposit: unit.deposit,
    location: unit.location,
    description: unit.description,
    images: unit.images || [],
    landlord: landlord?.name || '',
    landlordPhone: landlord?.phone || '',
  });
});

// ─── PUBLIC: preview of 3 vacant houses ───
// Used by the light variant of Products.jsx
exports.getHousesPreview = asyncHandler(async (req, res) => {
  const units = await Unit.find({ status: 'vacant' })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  res.json(units);
});

// ─── PUBLIC: all houses (used for related-houses logic) ───
exports.getHouses = asyncHandler(async (req, res) => {
  const units = await Unit.find().sort({ createdAt: -1 }).lean();
  res.json(units);
});

// ─── PUBLIC: get a single house by id ───
// Used by HouseDetail.jsx
exports.getHouseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const unit =
    (await Unit.findById(id).lean().catch(() => null)) ||
    (await Unit.findOne({ id }).lean());

  if (!unit) {
    throw new AppError('House not found', 404);
  }

  const landlord = await Landlord.findOne({ userId: unit.userId }).lean();

  res.json({
    _id: unit._id,
    houseType: unit.houseType,
    rent: unit.rent,
    deposit: unit.deposit,
    location: unit.location,
    description: unit.description,
    images: unit.images || [],
    status: unit.status,
    landlord: landlord?.name || '',
    landlordPhone: landlord?.phone || '',
  });
});

// ─── PUBLIC: get a landlord by userId ───
// Used by HouseDetail.jsx to show contact
exports.getLandlordById = asyncHandler(async (req, res) => {
  const { landlordId } = req.params;

  const landlord = await Landlord.findOne({ userId: landlordId }).lean();
  if (!landlord) {
    throw new AppError('Landlord not found', 404);
  }

  res.json({
    name: landlord.name || '',
    phone: landlord.phone || '',
  });
});

// ─── PROTECTED: add a new house ───
exports.addHouse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { houseType, rent, deposit, location, description, status } = req.body;
  const imageFiles = req.files || [];

  if (!houseType || !rent || !location) {
    throw new AppError('House type, rent, and location are required', 400);
  }

  let imageUrls = [];
  if (imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => uploadToCloudinary(file.buffer, 'renty/units'))
    );
  }

  const newUnit = new Unit({
    id: crypto.randomUUID(),
    userId,
    houseType,
    rent: parseFloat(rent),
    deposit: deposit ? parseFloat(deposit) : 0,
    location,
    description: description || '',
    images: imageUrls,
    status: status || 'vacant',
  });

  await newUnit.save();
  res.status(201).json(newUnit);
});

// ─── PROTECTED: update a house ───
exports.updateHouse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { houseType, rent, deposit, location, description, status } = req.body;
  const imageFiles = req.files || [];

  const unit = await Unit.findOne({ id, userId });
  if (!unit) {
    throw new AppError('House not found or unauthorized', 404);
  }

  if (houseType) unit.houseType = houseType;
  if (rent) unit.rent = parseFloat(rent);
  if (deposit !== undefined) unit.deposit = parseFloat(deposit);
  if (location) unit.location = location;
  if (description !== undefined) unit.description = description;
  if (status) unit.status = status;

  if (imageFiles.length > 0) {
    unit.images = await Promise.all(
      imageFiles.map((file) => uploadToCloudinary(file.buffer, 'renty/units'))
    );
  }

  await unit.save();
  res.json(unit);
});

// ─── PROTECTED: delete a house ───
exports.deleteHouse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await Unit.deleteOne({ id, userId });
  if (result.deletedCount === 0) {
    throw new AppError('House not found or unauthorized', 404);
  }

  res.json({ message: 'House deleted successfully' });
});