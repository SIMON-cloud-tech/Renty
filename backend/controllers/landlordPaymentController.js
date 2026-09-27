const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Client = require('../models/Client');
const { asyncHandler } = require('../utils/errorHandler');

exports.getLandlordPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    landlordId: req.user.id,
    status: 'approved', // <-- use { $in: ['paid', 'approved'] } to include payments awaiting approval
  }).lean();

  const [units, clients] = await Promise.all([
    Unit.find({ _id: { $in: payments.map(p => p.unitId) }, userId: req.user.id }).lean(),
    Client.find({ userId: { $in: payments.map(p => p.clientId) } }).select('userId name').lean(),
  ]);

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));

  // One row per unit + client
  const seen = new Set();
  const rows = [];
  for (const p of payments) {
    const key = `${p.unitId}-${p.clientId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const unit = unitById.get(String(p.unitId));
    rows.push({
      _id: key,
      house: unit?.houseType || '',
      location: unit?.location || '',
      rent: unit?.rent ?? null,
      client: clientNames.get(String(p.clientId)) || '',
    });
  }

  res.json(rows);
});