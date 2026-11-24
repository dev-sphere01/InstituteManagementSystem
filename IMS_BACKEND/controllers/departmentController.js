const Department = require('../models/departmentModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

const SEED_DEPARTMENTS = [
  { DeptID: 1, DeptName: 'Admissions', Description: 'Handles student admissions, application reviews, and onboarding.' },
  { DeptID: 2, DeptName: 'Accounts & Finance', Description: 'Handles fees, payroll, invoicing, and financial management.' },
  { DeptID: 3, DeptName: 'Academic & Faculty', Description: 'Manages curriculum, courses, classes, faculty, and academic programs.' },
  { DeptID: 4, DeptName: 'IT & Technical Support', Description: 'Technical infrastructure, software systems, and hardware support.' },
  { DeptID: 5, DeptName: 'Human Resources', Description: 'Staff recruitment, employee records, attendance, and benefits.' },
  { DeptID: 6, DeptName: 'Operations & Admin', Description: 'Campus operations, facility maintenance, and administrative tasks.' },
  { DeptID: 7, DeptName: 'Student Services', Description: 'Student support, counseling, extracurricular activities, and grievances.' },
  { DeptID: 8, DeptName: 'Examination', Description: 'Exam scheduling, hall tickets, grading, and certificate issuance.' },
  { DeptID: 9, DeptName: 'Marketing & Outreach', Description: 'Campaigns, lead acquisition, public relations, and admissions outreach.' },
];

// @desc    Get all departments (auto-seeds if empty)
// @route   GET /api/v1/departments
// @access  Public / Private
exports.getAllDepartments = catchAsyncErrors(async (req, res, next) => {
  let count = await Department.countDocuments();
  if (count === 0) {
    try {
      await Department.insertMany(SEED_DEPARTMENTS);
    } catch (err) {
      console.warn('Department seeder fallback notice:', err.message);
    }
  }

  const departments = await Department.find().sort({ DeptID: 1, createdAt: 1 });

  res.status(200).json({
    success: true,
    data: departments,
    departments,
  });
});

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private
exports.createDepartment = catchAsyncErrors(async (req, res, next) => {
  const { DeptName, Description, name, description } = req.body;
  const nameToUse = DeptName || name;
  const descToUse = Description || description || '';

  if (!nameToUse || !nameToUse.trim()) {
    return next(new ErrorHandler('Department name is required', 400));
  }

  const existing = await Department.findOne({
    DeptName: { $regex: new RegExp(`^${nameToUse.trim()}$`, 'i') },
  });
  if (existing) {
    return next(new ErrorHandler('Department with this name already exists', 400));
  }

  const count = await Department.countDocuments();
  const department = await Department.create({
    DeptID: count + 1,
    DeptName: nameToUse.trim(),
    Description: descToUse.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
    department,
  });
});

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private
exports.updateDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { DeptName, Description, name, description, IsActive } = req.body;

  let query = {};
  if (isNaN(id)) {
    query._id = id;
  } else {
    query.$or = [{ DeptID: Number(id) }, { _id: id }];
  }

  let department = await Department.findOne(query);
  if (!department && req.body._id) {
    department = await Department.findById(req.body._id);
  }

  if (!department) {
    return next(new ErrorHandler('Department not found', 404));
  }

  if (DeptName || name) department.DeptName = (DeptName || name).trim();
  if (Description !== undefined || description !== undefined) {
    department.Description = (Description !== undefined ? Description : description).trim();
  }
  if (IsActive !== undefined) department.IsActive = Boolean(IsActive);

  await department.save();

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department,
    department,
  });
});

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
// @access  Private
exports.deleteDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  let query = {};
  if (isNaN(id)) {
    query._id = id;
  } else {
    query.$or = [{ DeptID: Number(id) }, { _id: id }];
  }

  const department = await Department.findOne(query);
  if (!department) {
    return next(new ErrorHandler('Department not found', 404));
  }

  await department.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully',
  });
});
