const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// GET /api/workers/nearby?lat=&lng=&category=&radius=
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, category, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Location required' });

    const query = {
      isAvailable: true,
      isVerified: true,
      currentLocation: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000 // meters
        }
      }
    };

    if (category && category !== 'all') query.category = category;

    const workers = await Worker.find(query)
      .populate('user', 'name avatar phone location')
      .limit(20);

    // Calculate distance for each worker
    const workersWithDistance = workers.map(w => {
      const [wLng, wLat] = w.currentLocation.coordinates;
      const dist = getDistance(parseFloat(lat), parseFloat(lng), wLat, wLng);
      return { ...w.toObject(), distance: Math.round(dist * 10) / 10 };
    });

    res.json({ success: true, workers: workersWithDistance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workers/:id
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', 'name avatar phone location createdAt');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/workers/profile - Update worker profile
router.put('/profile', protect, restrictTo('worker'), async (req, res) => {
  try {
    const { bio, skills, hourlyRate, serviceRadius, experience, isAvailable } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { bio, skills, hourlyRate, serviceRadius, experience, isAvailable },
      { new: true }
    ).populate('user', 'name avatar phone');
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/workers/location - Update worker live location
router.put('/location', protect, restrictTo('worker'), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      {
        currentLocation: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        isOnline: true
      },
      { new: true }
    );
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workers/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { Review } = require('../models/ChatReview');
    const reviews = await Review.find({ worker: req.params.id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Haversine formula for distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function deg2rad(deg) { return deg * (Math.PI/180); }

module.exports = router;
