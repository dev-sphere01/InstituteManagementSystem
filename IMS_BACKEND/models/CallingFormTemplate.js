const mongoose = require('mongoose');

const callingFormTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  fields: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'number', 'email', 'date', 'textarea', 'radio', 'checkbox', 'select', 'file']
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    placeholder: {
      type: String,
      trim: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      type: String,
      trim: true
    }],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

callingFormTemplateSchema.index({ isActive: 1, isDefault: 1 });
callingFormTemplateSchema.index({ createdBy: 1 });

callingFormTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('CallingFormTemplate', callingFormTemplateSchema);
