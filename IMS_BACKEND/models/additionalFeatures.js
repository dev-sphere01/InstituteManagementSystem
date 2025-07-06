const mongoose = require('mongoose');

const AdditionalFeaturesSchema = new mongoose.Schema({
  AdditionalFeatures: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    trim: true
  },
  Type: {
    type: String,
    required: true,
    trim: true
  },
  Status: {
    type: String,
    required: true,
    trim: true
  },
}, {
  timestamps: true
});

const AdditionalFeatures = mongoose.model('AdditionalFeatures', AdditionalFeaturesSchema);
module.exports = AdditionalFeatures;
