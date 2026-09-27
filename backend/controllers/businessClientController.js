const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Landlord = require('../models/Landlord');
const Unit = require('../models/Unit');
const { asyncHandler } = require('../utils/errorHandler');

exports.getClients = asyncHandler(async (req, res) => {
  // Only payments that were actually made count as a client renting
  const payments = await Payment.find({ status: { $in: ['paid', 'approved'] } }).lean();

  const [clients, landlords, units] = await Promise.all([
    Client.find({ userId: { $in: payments.map(p => p.clientId) } }).select('userId name').lean(),
    Landlord.find({ userId: { $in: payments.map(p => p.landlordId) } }).select('userId name').lean(),
    Unit.find({ _id: { $in: payments.map(p => p.unitId) } }).select('location').lean(),
  ]);

  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));
  const landlordNames = new Map(landlords.map(l => [String(l.userId), l.name]));
  const unitLocations = new Map(units.map(u => [String(u._id), u.location]));

  // One row per client + landlord pair
  const seen = new Set();
  const rows = [];
  for (const p of payments) {
    const key = `${p.clientId}-${p.landlordId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      _id: key,
      client: clientNames.get(String(p.clientId)) || '',
      landlord: landlordNames.get(String(p.landlordId)) || '',
      location: unitLocations.get(String(p.unitId)) || '',
    });
  }

  res.json(rows);
});