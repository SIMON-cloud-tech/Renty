const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getLandlordClients } = require('../controllers/landlordClientController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('landlord'), getLandlordClients);

module.exports = router;