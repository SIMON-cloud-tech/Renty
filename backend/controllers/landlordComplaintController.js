const Complaint = require('../models/Complaint');
const Client = require('../models/Client');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── PROTECTED: complaints addressed to the logged-in landlord ───
exports.getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ landlordId: req.user.id }).sort({ createdAt: -1 }).lean();

  const clients = await Client.find({ userId: { $in: complaints.map(c => c.clientId) } })
    .select('userId name')
    .lean();
  const clientNames = new Map(clients.map(c => [String(c.userId), c.name]));

  res.json(complaints.map(c => ({
    id: c.id,
    client: clientNames.get(String(c.clientId)) || '',
    complaint: c.message,
    status: c.status,
  })));
});

// ─── PROTECTED: build a WhatsApp link for one of the landlord's own complaints ───
exports.addressComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ id: req.params.id, landlordId: req.user.id });
  if (!complaint) throw new AppError('Complaint not found or unauthorized', 404);

  const client = await Client.findOne({ userId: complaint.clientId }).lean();
  const phone = client?.phone?.replace(/\D/g, '');
  if (!phone) throw new AppError('Client phone number not available', 404);

  const text = `Hello ${client.name}, this is regarding your complaint: "${complaint.message.slice(0, 200)}". I would like to help resolve it.`;

  complaint.status = 'addressed';
  complaint.addressedAt = new Date();
  await complaint.save();

  res.json({ url: `https://wa.me/${phone}?text=${encodeURIComponent(text)}` });
});