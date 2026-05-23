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
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
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
