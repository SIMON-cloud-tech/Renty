const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getClients } = require('../controllers/businessClientController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('business'), getClients);

module.exports = router;