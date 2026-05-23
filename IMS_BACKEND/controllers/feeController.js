const ApplicationFinance = require('../models/applicationFinance');
const Installment = require('../models/installment');
const Task = require('../models/task');
const { advanceTaskSequence } = require('./taskController');
const { getFinanceByTarget, applyPaymentToInstallment, applyDirectPayment, recalculateTotals, buildFeeSummary } = require('../services/feeService');

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
