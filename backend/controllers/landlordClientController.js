const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Client = require('../models/Client');
const { asyncHandler } = require('../utils/errorHandler');

exports.getLandlordClients = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    landlordId: req.user.id,
    status: { $in: ['paid', 'approved'] },
  }).lean();

  const [units, clients] = await Promise.all([
    Unit.find({ _id: { $in: payments.map(p => p.unitId) }, userId: req.user.id }).lean(),
    Client.find({ userId: { $in: payments.map(p => p.clientId) } }).select('userId name').lean(),
  ]);

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));

  // Total paid per unit + client
  const totals = new Map();
  for (const p of payments) {
    const key = `${p.unitId}-${p.clientId}`;
    const t = totals.get(key) || { clientId: p.clientId, unitId: p.unitId, amount: 0 };
    t.amount += p.amount || 0;
    totals.set(key, t);
  }

  // months = floor((total paid - deposit) / rent), never below 0
  const rows = [...totals].map(([key, t]) => {
    const unit = unitById.get(String(t.unitId));
    const rent = unit?.rent || 0;
    const deposit = unit?.deposit || 0;
    const months = rent > 0 ? Math.max(0, Math.floor((t.amount - deposit) / rent)) : 0;
    return {
      _id: key,
      client: clientNames.get(String(t.clientId)) || '',
      house: unit?.houseType || '',
      months,
      amount: t.amount,
    };
  });

  res.json(rows);
});