const express = require('express');
const {
  searchHouse,
  getHousesPreview,
  getHouses,
  getHouseById,
  getLandlordById,
  addHouse,
  updateHouse,
  deleteHouse,
} = require('../controllers/houseController');
const protect  = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// ─── PUBLIC ROUTES ───

// Search a house by location + budget (used by House.jsx)
router.get('/search', searchHouse);

// Preview of 3 vacant houses (used by Products.jsx light variant)
router.get('/units', getHousesPreview);

// All houses (used for related-houses logic in HouseDetail.jsx)
router.get('/units/all', getHouses);

// Landlord contact (used by HouseDetail.jsx)
router.get('/units/landlord/:landlordId', getLandlordById);

// Single house by id (used by HouseDetail.jsx)
router.get('/units/:id', getHouseById);

// ─── PROTECTED ROUTES ───

router.post('/', protect, upload.array('images', 5), addHouse);
router.put('/:id', protect, upload.array('images', 5), updateHouse);
router.delete('/:id', protect, deleteHouse);

module.exports = router;