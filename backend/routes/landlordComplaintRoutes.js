const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getMyComplaints, addressComplaint } = require('../controllers/landlordComplaintController');

const router = express.Router();

router.use(authMiddleware, requireRole('landlord'));

router.get('/', getMyComplaints);
router.post('/:id/address', addressComplaint);

module.exports = router;