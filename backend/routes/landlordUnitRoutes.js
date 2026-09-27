const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { AppError } = require('../utils/errorHandler');
const { getMyUnits, addUnit, updateUnit, deleteUnit } = require('../controllers/landlordUnitController');

const router = express.Router();

// Memory storage: files stay in RAM as buffers and go straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // 5 MB each, max 4 images
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new AppError('Only image files are allowed', 400)),
});

router.use(authMiddleware, requireRole('landlord'));

router.get('/', getMyUnits);
router.post('/', upload.array('images', 4), addUnit);
router.put('/:id', upload.array('images', 4), updateUnit);
router.delete('/:id', deleteUnit);

module.exports = router;