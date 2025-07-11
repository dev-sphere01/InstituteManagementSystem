const express = require('express');
const router = express.Router();
const countryStateCityController = require('../../../controllers/countryStateCityController');

// POST    /api/country-state-city         ➝ Create new country with states & cities
router.post('/', countryStateCityController.createCountry);

// GET     /api/country-state-city         ➝ Get all countries (with optional filters)
router.get('/', countryStateCityController.getAllCountries);

// GET     /api/country-state-city/:id     ➝ Get one country by ID
router.get('/:id', countryStateCityController.getCountryById);

// PUT     /api/country-state-city/:id     ➝ Update country
router.put('/:id', countryStateCityController.updateCountry);

// DELETE  /api/country-state-city/:id     ➝ Delete country
router.delete('/:id', countryStateCityController.deleteCountry);

module.exports = router;
