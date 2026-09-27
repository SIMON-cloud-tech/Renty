const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Client = require('../models/Client');
const Landlord = require('../models/Landlord');
const { asyncHandler } = require('../utils/errorHandler');

exports.getCancellations = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'cancelled' }).sort({ cancelledAt: -1 }).lean();

  const [units, clients, landlords] = await Promise.all([
    Unit.find({ _id: { $in: payments.map(p => p.unitId) } }).select('houseType location').lean(),
    Client.find({ userId: { $in: payments.map(p => p.clientId) } }).select('userId name').lean(),
    Landlord.find({ userId: { $in: payments.map(p => p.landlordId) } }).select('userId name').lean(),
  ]);

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));
  const landlordNames = new Map(landlords.map(l => [String(l.userId), l.name]));

  res.json(payments.map(p => {
    const unit = unitById.get(String(p.unitId));
    return {
      _id: p._id,
      landlord: landlordNames.get(String(p.landlordId)) || '',
      house: unit?.houseType || '',
      amount: p.amount ?? null,
      client: clientNames.get(String(p.clientId)) || '',
      location: unit?.location || '',
    };
  }));
});