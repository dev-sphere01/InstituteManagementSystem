const AdditionalThing = require('../models/additionalThings');
const ErrorHandler = require('../utils/ErrorHandler');

// Create AdditionalThing
exports.createAdditionalThing = async (req, res, next) => {
  try {
    const additionalThing = await AdditionalThing.create(req.body);
    res.status(201).json({ success: true, data: additionalThing });
  } catch (error) {
    next(error);
  }
};

// Get All AdditionalThings
exports.getAllAdditionalThings = async (req, res, next) => {
  try {
    const additionalThings = await AdditionalThing.find();
    res.status(200).json({ success: true, data: additionalThings });
  } catch (error) {
    next(error);
  }
};

// Get Single AdditionalThing by ID
exports.getAdditionalThingById = async (req, res, next) => {
  try {
    const additionalThing = await AdditionalThing.findById(req.params.id);
    if (!additionalThing) return next(new ErrorHandler('AdditionalThing not found', 404));
    res.status(200).json({ success: true, data: additionalThing });
  } catch (error) {
    next(error);
  }
};

// Delete AdditionalThing
exports.deleteAdditionalThing = async (req, res, next) => {
  try {
    const deleted = await AdditionalThing.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('AdditionalThing not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
