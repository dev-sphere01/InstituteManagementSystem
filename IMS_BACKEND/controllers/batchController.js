const Batch = require('../models/batches');
const ErrorHandler = require('../utils/ErrorHandler');

// Create Batch
exports.createBatch = async (req, res, next) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

// Get All Batches
exports.getAllBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find();
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
};

// Get Single Batch
exports.getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return next(new ErrorHandler('Batch not found', 404));
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

// Update Batch
exports.updateBatch = async (req, res, next) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBatch) return next(new ErrorHandler('Batch not found', 404));
    res.status(200).json({ success: true, data: updatedBatch });
  } catch (error) {
    next(error);
  }
};

// Delete Batch
exports.deleteBatch = async (req, res, next) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Batch not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
