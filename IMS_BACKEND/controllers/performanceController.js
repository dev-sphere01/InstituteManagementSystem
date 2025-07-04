const Performance = require('../models/performance');
const ErrorHandler = require('../utils/ErrorHandler');

// Create Performance
exports.createPerformance = async (req, res, next) => {
  try {
    const performance = await Performance.create(req.body);
    res.status(201).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

// Get All Performances
exports.getAllPerformances = async (req, res, next) => {
  try {
    const performances = await Performance.find();
    res.status(200).json({ success: true, data: performances });
  } catch (error) {
    next(error);
  }
};

// Get Single Performance by ID
exports.getPerformanceById = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) return next(new ErrorHandler('Performance not found', 404));
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

// Update Performance
exports.updatePerformance = async (req, res, next) => {
  try {
    const updatedPerformance = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPerformance) return next(new ErrorHandler('Performance not found', 404));
    res.status(200).json({ success: true, data: updatedPerformance });
  } catch (error) {
    next(error);
  }
};

// Delete Performance
exports.deletePerformance = async (req, res, next) => {
  try {
    const deleted = await Performance.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Performance not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
