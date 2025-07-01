const University = require('../models/university');
const ErrorHandler = require('../utils/ErrorHandler');

// Create University
exports.createUniversity = async (req, res, next) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// Get All Universities
exports.getAllUniversities = async (req, res, next) => {
  try {
    const universities = await University.find();
    res.status(200).json({ success: true, data: universities });
  } catch (error) {
    next(error);
  }
};

// Get Single University
exports.getUniversityById = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return next(new ErrorHandler('University not found', 404));
    res.status(200).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// Update University
exports.updateUniversity = async (req, res, next) => {
  try {
    const updatedUniversity = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUniversity) return next(new ErrorHandler('University not found', 404));
    res.status(200).json({ success: true, data: updatedUniversity });
  } catch (error) {
    next(error);
  }
};

// Delete University
exports.deleteUniversity = async (req, res, next) => {
  try {
    const deleted = await University.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('University not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
