const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  financeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplicationFinance',
    required: true,
    index: true
  },
  installmentNo: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending',
    index: true
  },
  // Expected payment month (C) — auto-suggested, editable
  expectedMonth: { type: Date },
  // Overdue tracking (D)
  overdueNotifiedAt: { type: Date },
  overdueCount: { type: Number, default: 0 },
  escalatedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'installments'
});

installmentSchema.index({ financeId: 1, installmentNo: 1 }, { unique: true });
installmentSchema.index({ financeId: 1, status: 1 });

module.exports = mongoose.model('Installment', installmentSchema);
