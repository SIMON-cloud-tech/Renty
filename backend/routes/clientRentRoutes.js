const express = require('express');
const router = express.Router();
const clientPaymentController = require('../controllers/clientPaymentController');
const authMiddleware = require('../middleware/authMiddleware'); // no destructuring
const requireRole = require('../middleware/requireRole');

router.post('/', authMiddleware, requireRole('client'), clientPaymentController.startRent);
router.get('/:paymentId/status', authMiddleware, requireRole('client'), clientPaymentController.getPaymentStatus);

module.exports = router;