// models/Guides.js
const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // your own string id (crypto.randomUUID(), not Date.now())
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // matches JWT's real _id
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 20000 },
  features: { type: [String], default: [] }, // array of feature/tip strings
  image: { type: String, default: '' },
}, { timestamps: true }); // auto createdAt/updatedAt — controller no longer needs to set them manually

module.exports = mongoose.model('Guide', guideSchema);