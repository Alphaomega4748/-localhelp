const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// POST /api/bookings - Create booking
router.post('/', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { workerId, category, description, scheduledAt, address, coordinates, paymentMethod, estimatedHours } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    if (!worker.isAvailable) return res.status(400).json({ success: false, message: 'Worker not available' });

    const totalAmount = worker.hourlyRate * (estimatedHours || 1);
    const platformFee = Math.round(totalAmount * 0.1); // 10% platform fee
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Booking.create({
      customer: req.user._id,
      worker: workerId,
      service: { category, description },
      scheduledAt,
      location: { address, coordinates },
      pricing: { hourlyRate: worker.hourlyRate, estimatedHours, totalAmount, platformFee, workerEarning: totalAmount - platformFee },
      payment: { method: paymentMethod || 'cash' },
      otp
    });

    await booking.populate([
      { path: 'customer', select: 'name phone avatar' },
      { path: 'worker', populate: { path: 'user', select: 'name phone avatar' } }
    ]);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/my - Get my bookings (customer or worker)
router.get('/my', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'customer') {
      query = { customer: req.user._id };
    } else {
      const worker = await Worker.findOne({ user: req.user._id });
      query = { worker: worker._id };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone avatar')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone avatar' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone avatar location')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('review');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/status - Accept/Reject/Complete
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, otp } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Start job: verify OTP
    if (status === 'ongoing') {
      if (otp !== booking.otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Complete job: update worker stats
    if (status === 'completed') {
      booking.completedAt = new Date();
      await Worker.findByIdAndUpdate(booking.worker, {
        $inc: { totalBookings: 1, totalEarnings: booking.pricing.workerEarning }
      });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
