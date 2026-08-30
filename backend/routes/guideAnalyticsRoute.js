const express = require('express');
const { getGuideAnalytics } = require('../controllers/guideAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authMiddleware, getGuideAnalytics);

module.exports = router;