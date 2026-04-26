// chat.routes.js
const express = require('express');
const router = express.Router();
const { Message } = require('../models/ChatReview');
const { protect } = require('../middleware/auth.middleware');

router.get('/:bookingId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ booking: req.params.bookingId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
