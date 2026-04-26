const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth.middleware');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, category, hourlyRate, bio, experience } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, phone, password, role: role || 'customer' });

    // If registering as worker, create worker profile
    if (role === 'worker') {
      await Worker.create({
        user: user._id,
        category,
        hourlyRate: hourlyRate || 200,
        bio: bio || '',
        experience: experience || 0
      });
    }

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = signToken(user._id);

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ user: user._id });
    }

    res.json({ success: true, token, user, workerProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    let workerProfile = null;
    if (req.user.role === 'worker') {
      workerProfile = await Worker.findOne({ user: req.user._id });
    }
    res.json({ success: true, user: req.user, workerProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, address, coordinates } = req.body;
    const updates = { name, phone };
    if (address) updates.location = { type: 'Point', coordinates: coordinates || [0,0], address };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
