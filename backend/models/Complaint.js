// models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['open', 'addressed'], default: 'open' },
  addressedAt: { type: Date, default: null },
}, { timestamps: true });

complaintSchema.index({ landlordId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);