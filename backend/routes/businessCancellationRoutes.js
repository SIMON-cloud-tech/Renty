const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getCancellations } = require('../controllers/businessCancellationController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('business'), getCancellations);

module.exports = router;