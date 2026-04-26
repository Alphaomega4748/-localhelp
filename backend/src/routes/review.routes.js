// review.routes.js
const express = require('express');
const router = express.Router();
const { Review } = require('../models/ChatReview');
const Booking = require('../models/Booking');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.post('/', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { bookingId, rating, comment, tags } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

    const review = await Review.create({
      booking: bookingId, customer: req.user._id,
      worker: booking.worker, rating, comment, tags
    });
    booking.review = review._id;
    await booking.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
