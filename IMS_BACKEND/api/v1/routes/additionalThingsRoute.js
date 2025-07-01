const express = require('express');
const router = express.Router();
const additionalThingsController = require('../../../controllers/additionalThingsController');

// Create AdditionalThing
router.post('/', additionalThingsController.createAdditionalThing);

// Get All AdditionalThings
router.get('/', additionalThingsController.getAllAdditionalThings);

// Get Single AdditionalThing by ID
router.get('/:id', additionalThingsController.getAdditionalThingById);

// Delete AdditionalThing
router.delete('/:id', additionalThingsController.deleteAdditionalThing);

module.exports = router;
