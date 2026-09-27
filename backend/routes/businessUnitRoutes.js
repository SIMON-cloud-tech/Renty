const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getUnits } = require('../controllers/businessUnitController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('business'), getUnits);

module.exports = router;