// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  unitId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Unit' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

  amount: { type: Number, required: true, min: 1 }, // snapshot of the amount charged
  type: { type: String, enum: ['booking', 'rent'], default: 'booking' },
  // pending = prompt sent; paid = M-Pesa confirmed, awaiting client approval; approved = released to landlord
  status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled', 'approved'], default: 'pending' },

  provider: { type: String, enum: ['intasend', 'daraja'], required: true },
  phone: { type: String, required: true, trim: true },
  providerRef: { type: String, unique: true, sparse: true }, // leave unset until known, never ''
  mpesaReceipt: { type: String, unique: true, sparse: true },
  paidAt: { type: Date, default: null },
  failureReason: { type: String, default: '', trim: true, maxlength: 300 },

  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: '', trim: true, maxlength: 300 },

  reconciled: { type: Boolean, default: false },
  reconciledAt: { type: Date, default: null },

  // ── Set by the webhook once M-Pesa confirms ──
  commission: { type: Number, default: 0, min: 0 },
  landlordAmount: { type: Number, default: 0, min: 0 },
  releaseAt: { type: Date, default: null },

  // ── Set by the release path (approve button or cron) ──
  payoutRef: { type: String, default: null },
  releasedAt: { type: Date, default: null },
}, { timestamps: true });

paymentSchema.index({ clientId: 1, createdAt: -1 });
paymentSchema.index({ landlordId: 1 });
paymentSchema.index({ unitId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
paymentSchema.index({ status: 1, releaseAt: 1 }); // for the release job's "paid + due" query

module.exports = mongoose.model('Payment', paymentSchema);