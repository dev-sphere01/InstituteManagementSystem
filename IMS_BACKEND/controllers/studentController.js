const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const Performance = require('../models/performanceModel');
const AdmissionDetails = require('../models/admission');
const Task = require('../models/task');
const { getFinanceByTarget, buildFeeSummary } = require('../services/feeService');

const pickCurrentTask = (tasks = []) => {
  const active = tasks.filter((t) => t.status !== 'completed');
  if (active.length === 0) return null;
  return active[0];
};

const buildWarnings = (tasks = [], feeSummary, admission = null) => {
  const warnings = [];
  const feeTask = tasks.find((t) => t.taskName === 'Fee Collection');
  if (feeTask && feeSummary) {
    if (feeSummary.percentage < 40) {
      warnings.push(`Fee only ${feeSummary.percentage}% paid (Need at least 40%)`);
    }
  }

  if (admission) {
    const statusesObj = admission.documentStatuses || {};
    const statuses = Object.values(statusesObj).map(s => s.status);
    // If there are no statuses yet or any status is 'pending', then documents are not fully verified
    const isVerified = statuses.length > 0 && statuses.every(s => s !== 'pending');
    if (!isVerified) {
      warnings.push('Documents not verified');
    }
  }

  return warnings;
};

exports.getExamDetails = catchAsyncErrors(async (req, res, next) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    return next(new ErrorHandler('Student ID not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Exam details fetched successfully',
    studentId: studentId,
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

  if (!id) {
    return next(new ErrorHandler('Student ID not found', 404));
  }

  const admission = await AdmissionDetails.findById(id).lean();
  if (!admission) {
    return next(new ErrorHandler('Student not found', 404));
  }

  const tasks = await Task.find({ studentId: admission._id })
    .sort({ createdAt: 1 });

  const financeData = await getFinanceByTarget('admission', admission._id);
  const feeSummary = financeData.summary || buildFeeSummary(financeData.finance, financeData.installments);
  const currentTask = pickCurrentTask(tasks);

  res.status(200).json({
    success: true,
    data: {
      admission,
      tasks,
      currentTask,
      fee: financeData,
      warnings: buildWarnings(tasks, feeSummary, admission)
    }
  });
});

exports.getAllStudents = catchAsyncErrors(async (req, res, next) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;
  const search = req.query.search || req.query.keyword || '';
  const status = req.query.status;

  const query = {};
  if (status) query.studentStatus = status;
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { fullName: searchRegex },
      { generatedRegNo: searchRegex },
      { formNo: searchRegex },
      { contactNumber: searchRegex },
      { emailAddress: searchRegex }
    ];
  }

  const totalCount = await AdmissionDetails.countDocuments(query);
  const admissions = await AdmissionDetails.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const admissionIds = admissions.map((a) => a._id);
  const tasks = await Task.find({ studentId: { $in: admissionIds } })
    .select('studentId status taskName')
    .lean();

  const finance = await require('../models/applicationFinance')
    .find({ targetType: 'admission', targetId: { $in: admissionIds } })
    .select('targetId totalFee totalPaid')
    .lean();

  const tasksByAdmission = tasks.reduce((acc, t) => {
    const key = t.studentId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const financeByAdmission = finance.reduce((acc, f) => {
    acc[f.targetId.toString()] = f;
    return acc;
  }, {});

  const students = admissions.map((admission) => {
    const taskList = tasksByAdmission[admission._id.toString()] || [];
    const currentTask = pickCurrentTask(taskList);
    const fee = financeByAdmission[admission._id.toString()];
    const totalFee = Number(fee?.totalFee || 0);
    const totalPaid = Number(fee?.totalPaid || 0);
    const percentage = totalFee > 0 ? Math.round((totalPaid / totalFee) * 10000) / 100 : 0;

    return {
      _id: admission._id,
      name: admission.fullName,
      email: admission.emailAddress,
      contact: admission.contactNumber,
      formNo: admission.formNo,
      generatedRegNo: admission.generatedRegNo,
      course: admission.courseApplied,
      feePercentage: percentage,
      currentTask: currentTask ? currentTask.taskName : 'All Completed',
      currentTaskStatus: currentTask ? currentTask.status : 'completed',
      studentStatus: admission.studentStatus || admission.status
    };
  });

    res.status(200).json({
    success: true,
    count: students.length,
    totalCount,
    page,
    limit,
    students
  });
});

exports.updateDocumentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { docKey, status, remark } = req.body;

  if (!id || !docKey || !status) {
    return next(new ErrorHandler('Missing required parameters', 400));
  }

  const admission = await AdmissionDetails.findById(id);
  if (!admission) {
    return next(new ErrorHandler('Student not found', 404));
  }

  const updateQuery = {
    $set: {
      [`documentStatuses.${docKey}.status`]: status,
      [`documentStatuses.${docKey}.remark`]: remark || ''
    }
  };

  await AdmissionDetails.updateOne({ _id: id }, updateQuery);

  // Fetch updated admission to return the new statuses
  const updatedAdmission = await AdmissionDetails.findById(id).select('documentStatuses').lean();

  res.status(200).json({
    success: true,
    message: 'Document status updated successfully',
    documentStatuses: updatedAdmission.documentStatuses || {}
  });
});
