const CentreCode = require('../models/centreCode');
const ErrorHandler = require('../utils/ErrorHandler');

// Create CentreCode
exports.createCentreCode = async (req, res, next) => {
  try {
    const centre = await CentreCode.create(req.body);
    res.status(201).json({ success: true, data: centre });
  } catch (error) {
    next(error);
  }
};

// Get All CentreCodes
exports.getAllCentreCodes = async (req, res, next) => {
  try {
    const centres = await CentreCode.find();
    res.status(200).json({ success: true, data: centres });
  } catch (error) {
    next(error);
  }
};

// Get Single CentreCode
exports.getCentreCodeById = async (req, res, next) => {
  try {
    const centre = await CentreCode.findById(req.params.id);
    if (!centre) return next(new ErrorHandler('Centre code not found', 404));
    res.status(200).json({ success: true, data: centre });
  } catch (error) {
    next(error);
  }
};

// Update CentreCode
exports.updateCentreCode = async (req, res, next) => {
  try {
    const updatedCentre = await CentreCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCentre) return next(new ErrorHandler('Centre code not found', 404));
    res.status(200).json({ success: true, data: updatedCentre });
  } catch (error) {
    next(error);
  }
};

// Delete CentreCode
exports.deleteCentreCode = async (req, res, next) => {
  try {
    const deleted = await CentreCode.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Centre code not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
