const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const Performance = require('../models/performanceModel');

exports.getExamDetails = catchAsyncErrors(async (req, res, next) => {
  const studentId = req.params.studentId;

  // TODO: Fetch exam details from database based on studentId

  if (!studentId) {
    return next(new ErrorHandler('Student ID not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Exam details fetched successfully',
    studentId: studentId,
    //examDetails: examDetails,
  });
});

exports.getStudentPerformance = catchAsyncErrors(async (req, res, next) => {
  const studentId = req.params.studentId;

  const studentPerformance = await Performance.findOne({ studentId });

  if (!studentId) {
    return next(new ErrorHandler('Student ID not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Student performance fetched successfully',
    studentId: studentId,
    studentPerformance: studentPerformance,
  });
});
exports.getStudentProfile = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  // TODO: Fetch student profile from database based on id

  if (!id) {
    return next(new ErrorHandler('Student ID not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Student profile fetched successfully',
    studentId: id,
    //studentProfile: studentProfile,
  });
});
exports.getAllStudents = catchAsyncErrors(async (req, res, next) => {
  // TODO: Fetch all students from database
  res.status(200).json({
    success: true,
    message: 'All students fetched successfully',
    students: [],
  });
});