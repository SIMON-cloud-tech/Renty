const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getLandlordCancellations } = require('../controllers/landlordCancellationController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('landlord'), getLandlordCancellations);

module.exports = router;