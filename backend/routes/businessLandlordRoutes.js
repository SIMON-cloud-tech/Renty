const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getLandlords } = require('../controllers/businessLandlordController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('business'), getLandlords);

module.exports = router;