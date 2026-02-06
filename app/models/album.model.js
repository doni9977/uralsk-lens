const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  isPublic: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);