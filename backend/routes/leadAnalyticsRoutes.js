const express = require('express');
const { getLeadAnalytics } = require('../controllers/leadAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authMiddleware, getLeadAnalytics);

module.exports = router;