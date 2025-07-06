const AdditionalFeatures = require('../models/additionalFeatures');
const ErrorHandler = require('../utils/ErrorHandler');

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
    next(error);
  }
};

// Get All Additional Features
exports.getAllAdditionalFeatures = async (req, res, next) => {
  try {
    const additionalFeatures = await AdditionalFeatures.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      data: additionalFeatures,
      count: additionalFeatures.length
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Additional Feature by ID
exports.getAdditionalFeatureById = async (req, res, next) => {
  try {
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
    const additionalFeature = await AdditionalFeatures.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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
    next(error);
  }
};

// Delete Additional Feature
exports.deleteAdditionalFeature = async (req, res, next) => {
  try {
    const additionalFeature = await AdditionalFeatures.findByIdAndDelete(req.params.id);
    if (!additionalFeature) {
      return next(new ErrorHandler('Additional feature not found', 404));
    }
    res.status(200).json({ 
      success: true, 
      message: 'Additional feature deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};