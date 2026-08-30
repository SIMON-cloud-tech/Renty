const express = require('express');
const { getOverview } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/overview', authMiddleware, getOverview);

module.exports = router;