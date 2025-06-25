const express = require('express');
const router = express.Router();
const stateAndCitiesController = require('../../../controllers/stateAndCitiesController');

// Create State and Cities
router.post('/', stateAndCitiesController.createStateAndCity);

// Get All States and Cities
router.get('/', stateAndCitiesController.getAllStatesAndCities);

// Get Single State and Cities by ID
router.get('/:id', stateAndCitiesController.getStateAndCityById);

// Update State and Cities
router.put('/:id', stateAndCitiesController.updateStateAndCity);

// Delete State and Cities
router.delete('/:id', stateAndCitiesController.deleteStateAndCity);

module.exports = router;
