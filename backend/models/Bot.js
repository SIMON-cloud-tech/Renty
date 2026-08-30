// models/Bot.js
const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  keywords: { 
    type: [String], 
    default: [] 
  },
  reply: { 
    type: String, 
    default: '' 
  },
  context: { 
    type: Map, 
    of: String, 
    default: {} 
  },
  category: { 
    type: String, 
    default: 'general' 
  },
  // Fields for unanswered questions
  isAnswered: { 
    type: Boolean, 
    default: true 
  },
  question: { 
    type: String, 
    default: '' 
  },
  askedBy: { 
    type: String, 
    default: 'anonymous' 
  },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'answered', 'ignored'], 
    default: 'active' 
  },
  answeredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  answeredAt: { 
    type: Date, 
    default: null 
  },
  frequency: { 
    type: Number, 
    default: 1 
  }
}, { timestamps: true });

module.exports = mongoose.model('Bot', botSchema);