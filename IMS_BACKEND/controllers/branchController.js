const Branch = require('../models/Branch');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

// Create Branch
exports.createBranch = async (req, res, next) => {
  try {
    const { branchName, branchCode, city, state } = req.body;

    if (!branchName || !branchCode || !city || !state) {
      return next(new ErrorHandler('Branch Name, Branch Code, City, and State are required fields', 400));
    }

    const existingBranch = await Branch.findOne({ branchCode });
    if (existingBranch) {
      return next(new ErrorHandler('Branch code already exists', 409));
    }

    const branch = await Branch.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorHandler(`${field} already exists`, 409));
    }
    next(error);
  }
};

// Get All Branches
exports.getAllBranches = async (req, res, next) => {
  try {
    const { page, limit, state, city, search, isActive } = req.query;

    const filter = {};
    if (state) filter.state = new RegExp(state, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { branchName: new RegExp(search, 'i') },
        { branchCode: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { state: new RegExp(search, 'i') }
      ];
    }

    let branches, total;

    if (page && limit) {
      const p = parseInt(page);
      const l = parseInt(limit);
      branches = await Branch.find(filter)
        .sort({ createdAt: -1 })
        .limit(l)
        .skip((p - 1) * l);

      total = await Branch.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: branches,
        pagination: {
          currentPage: p,
          totalPages: Math.ceil(total / l),
          totalRecords: total,
          hasNextPage: p < Math.ceil(total / l),
          hasPrevPage: p > 1
        }
      });
    }

    branches = await Branch.find(filter).sort({ branchName: 1 });

    return res.status(200).json({
      success: true,
      data: branches,
      totalRecords: branches.length
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Branch
exports.getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid branch ID', 400));
    }

    const branch = await Branch.findById(id);
    if (!branch) {
      return next(new ErrorHandler('Branch not found', 404));
    }

    res.status(200).json({
      success: true,
      data: branch
    });
  } catch (error) {
    next(error);
  }
};

// Update Branch
exports.updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid branch ID', 400));
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedBranch) {
      return next(new ErrorHandler('Branch not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: updatedBranch
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorHandler(`${field} already exists`, 409));
    }
    next(error);
  }
};

// Delete Branch
exports.deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid branch ID', 400));
    }

    const deleted = await Branch.findByIdAndDelete(id);
    if (!deleted) {
      return next(new ErrorHandler('Branch not found', 404));
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
