const express = require('express');
const router = express.Router();
const performanceController = require('../../../controllers/performanceController');

// Create Performance
router.post('/', performanceController.createPerformance);

// Get All Performances
router.get('/', performanceController.getAllPerformances);

// Get Single Performance by ID
router.get('/:id', performanceController.getPerformanceById);

// Update Performance
router.put('/:id', performanceController.updatePerformance);

// Delete Performance
router.delete('/:id', performanceController.deletePerformance);

module.exports = router;
