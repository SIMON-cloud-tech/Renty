// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt hash, never plain text
  role: { type: String, enum: ['business', 'landlord', 'client'], default: 'client' },
}, { timestamps: true });

// The database itself guarantees only one business account can exist
userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: 'business' } });

module.exports = mongoose.model('User', userSchema);