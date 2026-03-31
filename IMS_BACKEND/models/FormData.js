const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  formName: {
    type: String,
    trim: true,
    maxlength: 150
  },
  formDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallingFormTemplate',
    required: false
  },
  linkId: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    default: 'public_link'
  },
  expiresAt: {
    type: Date
  },
  fields: [{
    fieldId: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      required: true
    },
    fieldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    required: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

formDataSchema.index({ linkId: 1, createdAt: -1 });

module.exports = mongoose.model('FormData', formDataSchema);
