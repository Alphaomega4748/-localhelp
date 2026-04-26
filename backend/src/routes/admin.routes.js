const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes protected for admin only
router.use(protect, restrictTo('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalWorkers, totalBookings, completedBookings] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Worker.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' })
    ]);

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.platformFee' } } }
    ]);

    res.json({ success: true, stats: {
      totalUsers, totalWorkers, totalBookings, completedBookings,
      revenue: revenueResult[0]?.total || 0
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/workers', async (req, res) => {
  try {
    const workers = await Worker.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, workers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/workers/:id/verify', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name phone')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
