const express = require('express');
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - anyone can submit a lead
router.post('/', createLead);

// Protected routes - require authentication
router.get('/', authMiddleware, getLeads);
router.get('/stats', authMiddleware, getLeadStats);
router.get('/:id', authMiddleware, getLead);
router.put('/:id', authMiddleware, updateLead);
router.delete('/:id', authMiddleware, deleteLead);

module.exports = router;