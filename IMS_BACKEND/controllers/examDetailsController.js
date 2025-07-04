const ExamDetail = require('../models/examDetails');
const ErrorHandler = require('../utils/ErrorHandler');

// Create ExamDetail
exports.createExamDetail = async (req, res, next) => {
  try {
    const examDetail = await ExamDetail.create(req.body);
    res.status(201).json({ success: true, data: examDetail });
  } catch (error) {
    next(error);
  }
};

// Get All ExamDetails
exports.getAllExamDetails = async (req, res, next) => {
  try {
    const examDetails = await ExamDetail.find();
    res.status(200).json({ success: true, data: examDetails });
  } catch (error) {
    next(error);
  }
};

// Get Single ExamDetail by ID
exports.getExamDetailById = async (req, res, next) => {
  try {
    const examDetail = await ExamDetail.findById(req.params.id);
    if (!examDetail) return next(new ErrorHandler('ExamDetail not found', 404));
    res.status(200).json({ success: true, data: examDetail });
  } catch (error) {
    next(error);
  }
};

// Update ExamDetail
exports.updateExamDetail = async (req, res, next) => {
  try {
    const updatedExamDetail = await ExamDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExamDetail) return next(new ErrorHandler('ExamDetail not found', 404));
    res.status(200).json({ success: true, data: updatedExamDetail });
  } catch (error) {
    next(error);
  }
};

// Delete ExamDetail
exports.deleteExamDetail = async (req, res, next) => {
  try {
    const deleted = await ExamDetail.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('ExamDetail not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
