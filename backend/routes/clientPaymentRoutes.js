const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getClientPayments } = require('../controllers/clientPaymentController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('client'), getClientPayments);

module.exports = router;