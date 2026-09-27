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
//public /Get method
router.get('/', getGuides);
router.get('/:id', getGuideById);

//protected guide.
router.post('/', authMiddleware, addGuide);
router.put('/:id', authMiddleware, updateGuide);
router.delete('/:id', authMiddleware, deleteGuide);

module.exports = router;