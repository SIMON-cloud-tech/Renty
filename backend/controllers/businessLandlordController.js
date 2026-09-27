const Landlord = require('../models/Landlord');
const Unit = require('../models/Unit');
const { asyncHandler } = require('../utils/errorHandler');

exports.getLandlords = asyncHandler(async (req, res) => {
  const [landlords, units] = await Promise.all([
    Landlord.find().lean(),
    Unit.find().select('userId location status').lean(),
  ]);

  // landlord userId -> location -> { total, occupied }
  const byLandlord = new Map();
  for (const u of units) {
    const lid = String(u.userId);
    if (!byLandlord.has(lid)) byLandlord.set(lid, new Map());
    const locations = byLandlord.get(lid);
    const loc = u.location || '';
    if (!locations.has(loc)) locations.set(loc, { total: 0, occupied: 0 });
    const stats = locations.get(loc);
    stats.total += 1;
    if (u.status === 'occupied') stats.occupied += 1;
  }

  // One row per landlord + location; landlords with no units still appear
  const rows = [];
  for (const l of landlords) {
    const locations = byLandlord.get(String(l.userId));
    if (!locations || locations.size === 0) {
      rows.push({ _id: `${l._id}-none`, landlord: l.name || '', phone: l.phone || '', location: '', total: 0, occupied: 0 });
      continue;
    }
    for (const [location, stats] of locations) {
      rows.push({
        _id: `${l._id}-${location}`,
        landlord: l.name || '',
        phone: l.phone || '',
        location,
        total: stats.total,
        occupied: stats.occupied,
      });
    }
  }

  res.json(rows);
});