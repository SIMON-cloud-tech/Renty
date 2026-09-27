// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, match: /^254\d{9}$/ }, // 2547XXXXXXXX
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);