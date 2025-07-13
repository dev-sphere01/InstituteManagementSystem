// models/additionalFeatures.js
const mongoose = require('mongoose');

const AdditionalFeaturesSchema = new mongoose.Schema({
  additionalFeatures: {
    type: String,
    required: [true, 'Additional features field is required'],
    trim: true,
    maxlength: [200, 'Additional features cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  // type: {
  //   type: String,
  //   required: [true, 'Type is required'],
  //   trim: true,
  //   enum: {
  //     values: ['feature', 'addon', 'service', 'upgrade'],
  //     message: 'Type must be one of: feature, addon, service, upgrade'
  //   }
  // },
  status: {
    type: String,
    required: [true, 'Status is required'],
    trim: true,
    enum: {
      values: ['active', 'inactive', 'pending', 'deprecated'],
      message: 'Status must be one of: active, inactive, pending, deprecated'
    },
    default: 'active'
  },
}, {
  timestamps: true
});

// Add index for better query performance
AdditionalFeaturesSchema.index({ status: 1, type: 1 });

const AdditionalFeatures = mongoose.model('AdditionalFeatures', AdditionalFeaturesSchema);
module.exports = AdditionalFeatures;