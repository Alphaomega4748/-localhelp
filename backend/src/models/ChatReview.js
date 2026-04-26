const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  tags: [{ type: String }], // ['professional', 'on-time', 'clean work']
}, { timestamps: true });

// Update worker rating after review
reviewSchema.post('save', async function() {
  const Worker = require('./Worker');
  const reviews = await mongoose.model('Review').find({ worker: this.worker });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Worker.findByIdAndUpdate(this.worker, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length
  });
});

const Message = mongoose.model('Message', messageSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = { Message, Review };
