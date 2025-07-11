const express = require('express');
const router = express.Router();
const additionalFeaturesController = require('../../../controllers/additionalFeatures');

// Create AdditionalFeature
router.post('/', additionalFeaturesController.createAdditionalFeature);

// Get All AdditionalFeatures (with optional filtering and pagination)
router.get('/', additionalFeaturesController.getAllAdditionalFeatures);

// Get Single AdditionalFeature by ID
router.get('/:id', additionalFeaturesController.getAdditionalFeatureById);

// Update AdditionalFeature
router.put('/:id', additionalFeaturesController.updateAdditionalFeature);

// Delete AdditionalFeature
router.delete('/:id', additionalFeaturesController.deleteAdditionalFeature);

module.exports = router;