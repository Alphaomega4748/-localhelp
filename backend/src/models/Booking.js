const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  service: {
    category: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledAt: { type: Date, required: true },
  completedAt: { type: Date },
  location: {
    address: { type: String, required: true },
    coordinates: { type: [Number], required: true }
  },
  pricing: {
    hourlyRate: { type: Number },
    estimatedHours: { type: Number },
    totalAmount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    workerEarning: { type: Number, default: 0 }
  },
  payment: {
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    method: { type: String, enum: ['online', 'cash'], default: 'cash' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date }
  },
  otp: { type: String }, // OTP to start job
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  cancellationReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
