const express = require('express');
const router = express.Router();
const additionalFeaturesController = require('../../../controllers/additionalFeaturesController');

// Create AdditionalFeature
router.post('/', additionalFeaturesController.createAdditionalFeature);

// Get All AdditionalFeatures
router.get('/', additionalFeaturesController.getAllAdditionalFeatures);

// Get Single AdditionalFeature by ID
router.get('/:id', additionalFeaturesController.getAdditionalFeatureById);

// Delete AdditionalFeature
router.delete('/:id', additionalFeaturesController.deleteAdditionalFeature);

// Update AdditionalFeature
router.put('/:id', additionalFeaturesController.updateAdditionalFeature);

module.exports = router;
