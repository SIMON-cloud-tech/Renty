// routes/testimonialRoute.js — unchanged, no edits needed
const express = require('express');
const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getTestimonials);

router.post('/', authMiddleware, addTestimonial);
router.put('/:id', authMiddleware, updateTestimonial);
router.delete('/:id', authMiddleware, deleteTestimonial);

module.exports = router;