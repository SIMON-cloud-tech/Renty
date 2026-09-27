const express = require('express');
const { getProductAnalytics } = require('../controllers/productAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authMiddleware, getProductAnalytics);

module.exports = router;