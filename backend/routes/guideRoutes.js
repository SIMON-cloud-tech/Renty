const express = require('express');
const {
  getGuides,
  addGuide,
  getGuideById,
  updateGuide,
  deleteGuide
} = require('../controllers/guidesController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// public
router.get('/', getGuides);
router.get('/:id', getGuideById);

// protected
router.post('/', authMiddleware, upload.single('image'), addGuide);
router.put('/:id', authMiddleware, upload.single('image'), updateGuide);
router.delete('/:id', authMiddleware, deleteGuide);

module.exports = router;