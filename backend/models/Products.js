// models/Products.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['normal', 'offer'], default: 'normal' },
  category: { 
    type: String, 
    enum: ['sofas', 'beds', 'tables', 'outdoor', 'office', 'tv-stands', 'stools', 'wardrobes', 'seats'],
    default: 'tables' 
  },
  room: { 
    type: String, 
    enum: ['living-room', 'bedroom', 'kitchen', 'home-office', 'outdoor-spaces'],
    default: 'living-room' 
  },
  features: { type: [String], default: [] },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);