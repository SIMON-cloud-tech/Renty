// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    default: '', 
    trim: true 
  },
  message: { 
    type: String, 
    required: true, 
    trim: true 
  },
  source: { 
    type: String, 
    default: 'contact_form',
    enum: ['contact_form', 'whatsapp', 'phone', 'email', 'walk_in', 'other']
  },
  status: { 
    type: String, 
    default: 'new',
    enum: ['new', 'contacted', 'converted', 'closed']
  },
  notes: { 
    type: String, 
    default: '' 
  },
  contactedAt: { 
    type: Date, 
    default: null 
  },
  convertedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);