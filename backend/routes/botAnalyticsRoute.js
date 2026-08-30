const express = require('express');
const { getBotAnalytics } = require('../controllers/botAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authMiddleware, getBotAnalytics);

module.exports = router;