const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Landlord = require('../models/Landlord');
const { asyncHandler } = require('../utils/errorHandler');

exports.getClientUnits = asyncHandler(async (req, res) => {
  // Only this client's own payments that were actually paid
  const payments = await Payment.find({
    clientId: req.user.id,
    status: { $in: ['paid', 'approved'] },
  }).lean();

  const units = await Unit.find({ _id: { $in: payments.map(p => p.unitId) } }).lean();

  const landlords = await Landlord.find({
    userId: { $in: units.map(u => u.userId) },
  }).select('userId name phone').lean();

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const landlordByUserId = new Map(landlords.map(l => [String(l.userId), l]));

  // One row per unit, amount = total paid for that unit
  const totals = new Map();
  for (const p of payments) {
    const key = String(p.unitId);
    totals.set(key, (totals.get(key) || 0) + (p.amount || 0));
  }

  const rows = [...totals].map(([unitId, amount]) => {
    const unit = unitById.get(unitId);
    const landlord = unit ? landlordByUserId.get(String(unit.userId)) : null;
    return {
      _id: unitId,
      house: unit?.houseType || '',
      amount,
      location: unit?.location || '',
      landlordName: landlord?.name || '',
      landlordPhone: landlord?.phone || '',
    };
  });

  res.json(rows);
});