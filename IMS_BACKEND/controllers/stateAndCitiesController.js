const StateAndCity = require('../models/stateAndCities');
const ErrorHandler = require('../utils/ErrorHandler');

// Create StateAndCity
exports.createStateAndCity = async (req, res, next) => {
  try {
    const stateAndCity = await StateAndCity.create(req.body);
    res.status(201).json({ success: true, data: stateAndCity });
  } catch (error) {
    next(error);
  }
};

// Get All States and Cities
exports.getAllStatesAndCities = async (req, res, next) => {
  try {
    const states = await StateAndCity.find();
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
};

// Get Single State and Cities by ID
exports.getStateAndCityById = async (req, res, next) => {
  try {
    const state = await StateAndCity.findById(req.params.id);
    if (!state) return next(new ErrorHandler('State not found', 404));
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

// Update State and Cities
exports.updateStateAndCity = async (req, res, next) => {
  try {
    const updated = await StateAndCity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return next(new ErrorHandler('State not found', 404));
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete State and Cities
exports.deleteStateAndCity = async (req, res, next) => {
  try {
    const deleted = await StateAndCity.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('State not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
