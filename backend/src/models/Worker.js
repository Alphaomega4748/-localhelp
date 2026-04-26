const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  category: {
    type: String,
    enum: ['electrician', 'plumber', 'carpenter', 'painter', 'cleaner', 'mechanic', 'helper', 'ac_repair', 'pest_control', 'other'],
    required: true
  },
  skills: [{ type: String }],
  bio: { type: String, maxlength: 500 },
  experience: { type: Number, default: 0 }, // years
  hourlyRate: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  serviceRadius: { type: Number, default: 10 }, // km
  documents: {
    idProof: { type: String, default: '' },
    certificate: { type: String, default: '' }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  workImages: [{ type: String }],
}, { timestamps: true });

workerSchema.index({ currentLocation: '2dsphere' });
workerSchema.index({ category: 1, isAvailable: 1, isOnline: 1 });

module.exports = mongoose.model('Worker', workerSchema);
