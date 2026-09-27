const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getClientUnits } = require('../controllers/clientUnitController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('client'), getClientUnits);

module.exports = router;