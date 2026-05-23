const mongoose = require('mongoose');

const feeTransactionSchema = new mongoose.Schema({
  financeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplicationFinance',
    required: true,
    index: true
  },
  installmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Installment',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  method: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'feeTransactions'
});

feeTransactionSchema.index({ financeId: 1, paymentDate: -1 });
feeTransactionSchema.index({ installmentId: 1, paymentDate: -1 });

module.exports = mongoose.model('FeeTransaction', feeTransactionSchema);
