const express = require('express');
const router = express.Router();
const controller = require('../../../controllers/countryStateCityController');

// POST    ➝ Create new country
router.post('/', controller.createCountry);

// GET     ➝ Get all countries
router.get('/', controller.getAllCountries);

// GET     ➝ Get all states of first country (for dropdown)
router.get('/states/all', controller.getStates);

// GET     ➝ Get cities of selected state
router.get('/cities/:stateName', controller.getCitiesByState);

// GET     ➝ Get one country by ID
router.get('/:id', controller.getCountryById);

// PUT     ➝ Update country
router.put('/:id', controller.updateCountry);

// DELETE  ➝ Delete country
router.delete('/:id', controller.deleteCountry);

module.exports = router;
