const express = require('express');
const router = express.Router();
const {
  createCentreCode,
  getAllCentreCodes,
  getCentreCodeById,
  getCentreByCode,
  updateCentreCode,
  deleteCentreCode,
  getCentresByState,
  getCentresByCity,
  getCentreStats
} = require('./../../../controllers/centreCodeController');

// @desc    Create a new centre code
// @route   POST /api/centres
// @access  Private (add your auth middleware here)
router.post('/', createCentreCode);

// @desc    Get all centre codes with pagination and filtering
// @route   GET /api/centres
// @access  Public
// @query   page, limit, State, City, search
router.get('/', getAllCentreCodes);

// @desc    Get centre statistics
// @route   GET /api/centres/stats
// @access  Public
router.get('/stats', getCentreStats);

// @desc    Get centres by state
// @route   GET /api/centres/state/:state
// @access  Public
router.get('/state/:state', getCentresByState);

// @desc    Get centres by city
// @route   GET /api/centres/city/:city
// @access  Public
router.get('/city/:city', getCentresByCity);

// @desc    Get centre by centre code
// @route   GET /api/centres/code/:code
// @access  Public
router.get('/code/:code', getCentreByCode);

// @desc    Get centre by ID
// @route   GET /api/centres/:id
// @access  Public
router.get('/:id', getCentreCodeById);

// @desc    Update centre code
// @route   PUT /api/centres/:id
// @access  Private (add your auth middleware here)
router.put('/:id', updateCentreCode);

// @desc    Delete centre code
// @route   DELETE /api/centres/:id
// @access  Private (add your auth middleware here)
router.delete('/:id', deleteCentreCode);

module.exports = router;