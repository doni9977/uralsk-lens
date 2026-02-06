const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'Other' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// text index for search
photoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Photo', photoSchema);
