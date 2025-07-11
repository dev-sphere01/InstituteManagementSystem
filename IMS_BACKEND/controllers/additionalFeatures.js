// controllers/additionalFeaturesController.js
const AdditionalFeatures = require('../models/additionalFeatures');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create Additional Feature
exports.createAdditionalFeature = async (req, res, next) => {
  try {
    const additionalFeature = await AdditionalFeatures.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: additionalFeature,
      message: 'Additional feature created successfully'
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new ErrorHandler(message, 400));
    }
    next(error);
  }
};

// Get All Additional Features with filtering and pagination
exports.getAllAdditionalFeatures = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const additionalFeatures = await AdditionalFeatures
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await AdditionalFeatures.countDocuments(filter);
    
    res.status(200).json({ 
      success: true, 
      data: additionalFeatures,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalCount / parseInt(limit)),
        total: totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Additional Feature by ID
exports.getAdditionalFeatureById = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorHandler('Invalid ID format', 400));
    }
    
    const additionalFeature = await AdditionalFeatures.findById(req.params.id);
    if (!additionalFeature) {
      return next(new ErrorHandler('Additional feature not found', 404));
    }
    
    res.status(200).json({ 
      success: true, 
      data: additionalFeature 
    });
  } catch (error) {
    next(error);
  }
};

// Update Additional Feature
exports.updateAdditionalFeature = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorHandler('Invalid ID format', 400));
    }
    
    const additionalFeature = await AdditionalFeatures.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true,
        context: 'query' 
      }
    );
    
    if (!additionalFeature) {
      return next(new ErrorHandler('Additional feature not found', 404));
    }
    
    res.status(200).json({ 
      success: true, 
      data: additionalFeature,
      message: 'Additional feature updated successfully'
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new ErrorHandler(message, 400));
    }
    next(error);
  }
};

// Delete Additional Feature
exports.deleteAdditionalFeature = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorHandler('Invalid ID format', 400));
    }
    
    const additionalFeature = await AdditionalFeatures.findByIdAndDelete(req.params.id);
    if (!additionalFeature) {
      return next(new ErrorHandler('Additional feature not found', 404));
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Additional feature deleted successfully',
      data: additionalFeature
    });
  } catch (error) {
    next(error);
  }};