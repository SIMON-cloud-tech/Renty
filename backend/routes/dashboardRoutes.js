// routes/dashboardRoute.js
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/dashboard/profile
// Protected — only the logged-in admin can view their own profile.
// req.user.id comes from the verified JWT (set by authMiddleware), never from the client.
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // never return the hash
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    console.error('Get dashboard profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;