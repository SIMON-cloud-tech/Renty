const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getLandlordPayments } = require('../controllers/landlordPaymentController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('landlord'), getLandlordPayments);

module.exports = router;