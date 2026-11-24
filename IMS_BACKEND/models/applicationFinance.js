const mongoose = require('mongoose');

const applicationFinanceSchema = new mongoose.Schema({
  targetType: {
    type: String,
    required: true,
    enum: ['admission', 'student', 'custom'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  totalFee: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: { type: Number, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  netPayable: { type: Number, default: 0, min: 0 },
  numInstallments: { type: Number, default: 1, min: 1 },
  installmentDurationMonths: { type: Number, default: 1, min: 1 },
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  // Change history (C)
  feeHistory: [{
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedByName: { type: String },
    field: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }],
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'applicationFinance'
});

applicationFinanceSchema.index({ targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('ApplicationFinance', applicationFinanceSchema);
