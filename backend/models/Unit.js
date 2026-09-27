// models/Unit.js
const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // public id (crypto.randomUUID())
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // the landlord who owns the unit
  houseType: {
    type: String,
    required: true,
    enum: ['single room', 'bedsitter', '1 bedroom', '2 bedroom', '3 bedroom'], // if you edit this, edit HOUSE_TYPES in LandlordUnits.jsx too
  },
  rent: { type: Number, required: true, min: 0 }, // monthly, in KES
  deposit: { type: Number, default: 0, min: 0 }, // one-time deposit in KES, part of the client's first payment(s)
  location: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', trim: true, maxlength: 5000 },
  images: { type: [String], default: [] },
   latitude:  { type: Number, default: null, min: -90,  max: 90 },
  longitude: { type: Number, default: null, min: -180, max: 180 },

  // 'reserved' holds the unit while an M-Pesa prompt is pending
  status: { type: String, enum: ['vacant', 'reserved', 'occupied'], default: 'vacant' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reservedUntil: { type: Date, default: null },
}, { timestamps: true });

unitSchema.index({ userId: 1 });
unitSchema.index({ status: 1, location: 1 });
unitSchema.index({ status: 1, latitude: 1, longitude: 1 });

module.exports = mongoose.model('Unit', unitSchema);