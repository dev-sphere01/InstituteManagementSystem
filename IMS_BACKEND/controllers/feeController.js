const ApplicationFinance = require('../models/applicationFinance');
const Installment = require('../models/installment');
const Task = require('../models/task');
const { advanceTaskSequence } = require('./taskController');
const { getFinanceByTarget, applyPaymentToInstallment, applyDirectPayment, recalculateTotals, buildFeeSummary } = require('../services/feeService');

/** Helper: build EMI schedule from startDate */
const buildEMISchedule = (numInstallments, netPayable, startDate) => {
  const list = [];
  const emiAmount = Math.round(netPayable / numInstallments);
  const remainder = netPayable - emiAmount * (numInstallments - 1);
  for (let i = 1; i <= numInstallments; i++) {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + (i - 1));
    list.push({
      installmentNo: i,
      amount: i === numInstallments ? remainder : emiAmount,
      dueDate: due, expectedMonth: due,
      status: 'Pending', paidAmount: 0,
    });
  }
  return list;
};

/**
 * POST /fees/setup  — Section C
 * Sets up or updates a fee plan with discount, installments and expected months.
 */
exports.setupFee = async (req, res) => {
  try {
    const {
      targetType = 'admission', targetId,
      totalFee, discountAmount = 0, discountPercent = 0,
      numInstallments = 1, installmentDurationMonths = 1,
      startDate, rebuildInstallments = false
    } = req.body;

    if (!targetId || totalFee === undefined) {
      return res.status(400).json({ success: false, message: 'targetId and totalFee are required' });
    }

    const discAmt = discountPercent > 0 ? (totalFee * discountPercent) / 100 : (Number(discountAmount) || 0);
    const netPayable = Math.max(0, totalFee - discAmt);

    let finance = await ApplicationFinance.findOne({ targetType, targetId });
    const isNew = !finance;

    if (isNew) {
      finance = new ApplicationFinance({
        targetType, targetId, totalFee, discountAmount: discAmt,
        discountPercent, netPayable, numInstallments,
        installmentDurationMonths, createdBy: req.user?._id
      });
    } else {
      const histEntry = { changedBy: req.user?._id, changedByName: req.user?.name || 'System', changedAt: new Date() };
      ['totalFee','discountAmount','discountPercent','netPayable','numInstallments'].forEach(f => {
        const newVal = f === 'discountAmount' ? discAmt : f === 'netPayable' ? netPayable : req.body[f];
        if (newVal !== undefined && finance[f] !== newVal) {
          if (!finance.feeHistory) finance.feeHistory = [];
          finance.feeHistory.push({ ...histEntry, field: f, oldValue: finance[f], newValue: newVal });
        }
      });
      finance.totalFee = totalFee;
      finance.discountAmount = discAmt;
      finance.discountPercent = discountPercent;
      finance.netPayable = netPayable;
      finance.numInstallments = numInstallments;
      finance.installmentDurationMonths = installmentDurationMonths;
      finance.updatedBy = req.user?._id;
    }

    await finance.save();

    if (isNew || rebuildInstallments) {
      await Installment.deleteMany({ financeId: finance._id });
      const start = startDate ? new Date(startDate) : new Date();
      const docs = buildEMISchedule(numInstallments, netPayable, start).map(i => ({ ...i, financeId: finance._id }));
      await Installment.insertMany(docs);
    }

    const installments = await Installment.find({ financeId: finance._id }).sort({ installmentNo: 1 });
    return res.status(201).json({ success: true, finance, installments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /fees/plan/:targetId  — Section C
 * Returns finance + installments + fee% for a student.
 */
exports.getFeePlan = async (req, res) => {
  try {
    const { targetId } = req.params;
    const targetType = req.query.targetType || 'admission';
    const finance = await ApplicationFinance.findOne({ targetType, targetId }).lean();
    if (!finance) return res.status(200).json({ success: true, finance: null, installments: [], feePercent: 0 });
    const installments = await Installment.find({ financeId: finance._id }).sort({ installmentNo: 1 }).lean();
    const feePercent = finance.netPayable > 0 ? Math.round((finance.totalPaid / finance.netPayable) * 100) : 0;
    return res.status(200).json({ success: true, finance, installments, feePercent });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const autoAdvanceFeeTask = async (targetId, totalPaid) => {
  if (Number(totalPaid) > 0) {
     const feeTask = await Task.findOne({ studentId: targetId, taskName: 'Fee Collection', status: { $ne: 'completed' } });
     if (feeTask) {
        feeTask.status = 'completed';
        feeTask.remarks.push({ text: 'Auto-completed via payment', by: 'System' });
        await feeTask.save();
        await advanceTaskSequence(feeTask);
     }
  }
};

exports.getFeeSummary = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const result = await getFinanceByTarget(targetType, targetId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeePlan = async (req, res) => {
  try {
    const { targetType, targetId, totalFee, currency, installments = [] } = req.body;
    if (!targetType || !targetId || totalFee === undefined) {
      return res.status(400).json({ success: false, message: 'targetType, targetId, totalFee are required' });
    }

    const finance = await ApplicationFinance.findOneAndUpdate(
      { targetType, targetId },
      {
        targetType,
        targetId,
        totalFee,
        currency: currency || 'INR',
        updatedBy: req.user ? req.user._id : undefined
      },
      { new: true, upsert: true }
    );

    if (Array.isArray(installments) && installments.length > 0) {
      await Installment.deleteMany({ financeId: finance._id });
      const payload = installments.map((inst, index) => ({
        financeId: finance._id,
        installmentNo: inst.installmentNo || index + 1,
        amount: Number(inst.amount || 0),
        dueDate: inst.dueDate,
        paidAmount: Number(inst.paidAmount || 0),
        status: inst.status || 'Pending'
      }));
      await Installment.insertMany(payload, { ordered: false });
    }

    const { finance: updatedFinance, installments: updatedInstallments } = await recalculateTotals(finance._id);
    const summary = buildFeeSummary(updatedFinance, updatedInstallments);

    return res.status(201).json({ success: true, data: { finance: updatedFinance, installments: updatedInstallments, summary } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addInstallments = async (req, res) => {
  try {
    const { financeId } = req.params;
    const { installments = [] } = req.body;
    if (!financeId) return res.status(400).json({ success: false, message: 'financeId is required' });

    const finance = await ApplicationFinance.findById(financeId);
    if (!finance) return res.status(404).json({ success: false, message: 'Finance record not found' });

    const payload = installments.map((inst, index) => ({
      financeId: finance._id,
      installmentNo: inst.installmentNo || index + 1,
      amount: Number(inst.amount || 0),
      dueDate: inst.dueDate,
      paidAmount: Number(inst.paidAmount || 0),
      status: inst.status || 'Pending'
    }));

    await Installment.insertMany(payload, { ordered: false });
    const { finance: updatedFinance, installments: updatedInstallments } = await recalculateTotals(finance._id);
    const summary = buildFeeSummary(updatedFinance, updatedInstallments);

    return res.status(201).json({ success: true, data: { finance: updatedFinance, installments: updatedInstallments, summary } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.payInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, reference, note, paymentDate } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'amount is required' });
    }

    const result = await applyPaymentToInstallment({
      installmentId: id,
      amount,
      method,
      reference,
      note,
      paymentDate,
      createdBy: req.user ? req.user._id : undefined
    });
    
    // Auto-advance if paid
    if (result.finance && result.finance.targetType === 'admission') {
       await autoAdvanceFeeTask(result.finance.targetId, result.finance.totalPaid);
    }
    
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.directPay = async (req, res) => {
  try {
    const { targetType, targetId, amount, method, reference, note, paymentDate } = req.body;
    if (!targetType || !targetId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'targetType, targetId and valid amount are required' });
    }

    const result = await applyDirectPayment({
      targetType,
      targetId,
      amount,
      method,
      reference,
      note,
      paymentDate,
      createdBy: req.user ? req.user._id : undefined
    });
    
    // Auto-advance if paid
    if (result.finance && result.finance.targetType === 'admission') {
       await autoAdvanceFeeTask(result.finance.targetId, result.finance.totalPaid);
    }
    
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
