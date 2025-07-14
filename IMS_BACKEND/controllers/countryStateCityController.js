const CountryStateCity = require('../models/countryStateCity');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ───────────── CREATE Country (with states & cities)
exports.createCountry = async (req, res, next) => {
  try {
    const country = await CountryStateCity.create(req.body);
    res.status(201).json({ success: true, data: country });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET All Countries (supports filter if needed)
exports.getAllCountries = async (req, res, next) => {
  try {
    const { region, nationality } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (nationality) filter.nationality = nationality;

    const countries = await CountryStateCity.find(filter).sort({ countryName: 1 });
    res.status(200).json({ success: true, data: countries });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET States of First Country (Useful for frontend)
exports.getStates = async (req, res, next) => {
  try {
    const country = await CountryStateCity.findOne(); // since you only have one
    if (!country) return next(new ErrorHandler('No country data found', 404));

    const states = country.states.map((s) => s.stateName);
    res.status(200).json({ success: true, data: states });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET Cities by State Name
exports.getCitiesByState = async (req, res, next) => {
  const { stateName } = req.params;

  try {
    const country = await CountryStateCity.findOne();
    if (!country) return next(new ErrorHandler('Country not found', 404));

    const state = country.states.find((s) => s.stateName === stateName);
    if (!state) return next(new ErrorHandler('State not found', 404));

    res.status(200).json({ success: true, data: state.cityNames });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET Single Country by ID
exports.getCountryById = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const country = await CountryStateCity.findById(req.params.id);
    if (!country) return next(new ErrorHandler('Country not found', 404));
    res.status(200).json({ success: true, data: country });
  } catch (err) {
    next(err);
  }
};

// ───────────── UPDATE Country
exports.updateCountry = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const updated = await CountryStateCity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return next(new ErrorHandler('Country not found', 404));
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ───────────── DELETE Country
exports.deleteCountry = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const deleted = await CountryStateCity.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Country not found', 404));
    res.status(204).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
