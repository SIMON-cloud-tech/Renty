// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // your own string id (crypto.randomUUID(), not Date.now())
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // matches JWT's real _id now
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 20000 },
  keywords: { type: String, default: '', trim: true, maxlength: 300 },
  image: { type: String, default: '' },
  views: { type: Number, default: 0 }
}, { timestamps: true }); // auto createdAt/updatedAt — controller no longer needs to set them manually

module.exports = mongoose.model('Blog', blogSchema);