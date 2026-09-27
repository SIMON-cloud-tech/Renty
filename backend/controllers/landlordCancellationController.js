const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Client = require('../models/Client');
const { asyncHandler } = require('../utils/errorHandler');

exports.getLandlordCancellations = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ landlordId: req.user.id, status: 'cancelled' })
    .sort({ cancelledAt: -1 })
    .lean();

  const [units, clients] = await Promise.all([
    Unit.find({ _id: { $in: payments.map(p => p.unitId) }, userId: req.user.id }).select('houseType').lean(),
    Client.find({ userId: { $in: payments.map(p => p.clientId) } }).select('userId name').lean(),
  ]);

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));

  res.json(payments.map(p => ({
    _id: p._id,
    house: unitById.get(String(p.unitId))?.houseType || '',
    amount: p.amount ?? null,
    client: clientNames.get(String(p.clientId)) || '',
  })));
});