const express = require('express');
const { getBlogAnalytics } = require('../controllers/blogAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authMiddleware, getBlogAnalytics);

module.exports = router;