const express = require('express');
const router = express.Router();
const batchController = require('../../../controllers/batchController');

// Create Batch
router.post('/', batchController.createBatch);

// Get All Batches
router.get('/', batchController.getAllBatches);

// Get Single Batch
router.get('/:id', batchController.getBatchById);

// Update Batch
router.put('/:id', batchController.updateBatch);

// Delete Batch
router.delete('/:id', batchController.deleteBatch);

module.exports = router;
