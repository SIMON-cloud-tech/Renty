const Unit = require('../models/Unit');
const Landlord = require('../models/Landlord');
const { asyncHandler } = require('../utils/errorHandler');

exports.getUnits = asyncHandler(async (req, res) => {
  const units = await Unit.find().sort({ createdAt: -1 }).lean();

  const landlords = await Landlord.find({ userId: { $in: units.map(u => u.userId) } })
    .select('userId name')
    .lean();
  const landlordNames = new Map(landlords.map(l => [String(l.userId), l.name]));

  res.json(units.map(u => ({
    _id: u._id,
    houseType: u.houseType,
    rent: u.rent,
    location: u.location,
    landlord: landlordNames.get(String(u.userId)) || '',
  })));
});