const ApplicationFinance = require('../models/applicationFinance');
const Installment = require('../models/installment');
const FeeTransaction = require('../models/feeTransaction');
const ErrorHandler = require('../utils/ErrorHandler');

const getFinanceByTarget = async (targetType, targetId) => {
  if (!targetType || !targetId) {
    throw new ErrorHandler('targetType and targetId are required', 400);
  }

  const finance = await ApplicationFinance.findOne({ targetType, targetId });
  if (!finance) return { finance: null, installments: [], transactions: [], summary: null };

  const installments = await Installment.find({ financeId: finance._id }).sort({ installmentNo: 1 });
  const transactions = await FeeTransaction.find({ financeId: finance._id }).sort({ paymentDate: -1 });
  const summary = buildFeeSummary(finance, installments);

  return { finance, installments, transactions, summary };
};

const buildFeeSummary = (finance, installments = []) => {
  if (!finance) return null;
  const totalFee = Number(finance.totalFee || 0);
  const totalPaid = Number(finance.totalPaid || 0);
  const paidAmount = totalPaid;
  const percentage = totalFee > 0 ? Math.round((totalPaid / totalFee) * 10000) / 100 : 0;
  const paidInstallments = installments.filter((i) => i.status === 'Paid').length;
  return {
    totalFee,
    paidAmount,
    percentage,
    paidInstallments,
    totalInstallments: installments.length
  };
};

const recalculateTotals = async (financeId) => {
  const transactions = await FeeTransaction.find({ financeId });
  const totalPaid = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const finance = await ApplicationFinance.findByIdAndUpdate(
    financeId,
    { totalPaid },
    { new: true }
  );

  const installments = await Installment.find({ financeId }).sort({ installmentNo: 1 });
  let remainingPaid = totalPaid;

  for (const inst of installments) {
    if (remainingPaid >= inst.amount) {
      inst.paidAmount = inst.amount;
      inst.status = 'Paid';
      remainingPaid -= inst.amount;
    } else if (remainingPaid > 0) {
      inst.paidAmount = remainingPaid;
      inst.status = 'Partial';
      remainingPaid = 0;
    } else {
      inst.paidAmount = 0;
      inst.status = 'Pending';
    }
    await inst.save();
  }

  return { finance, installments };
};

const applyDirectPayment = async ({ targetType, targetId, amount, method, reference, note, paymentDate, createdBy }) => {
  const numericAmount = Number(amount || 0);
  if (numericAmount <= 0) {
    throw new ErrorHandler('amount must be greater than 0', 400);
  }

  let finance = await ApplicationFinance.findOne({ targetType, targetId });
  if (!finance) {
    finance = await ApplicationFinance.create({
      targetType,
      targetId,
      totalFee: 0,
      totalPaid: 0,
      currency: 'INR',
      createdBy
    });
  }

  const transaction = await FeeTransaction.create({
    financeId: finance._id,
    amount: numericAmount,
    method,
    reference,
    note,
    paymentDate: paymentDate ? new Date(paymentDate) : Date.now(),
    createdBy
  });

  const totals = await recalculateTotals(finance._id);
  const summary = buildFeeSummary(totals.finance, totals.installments);

  return { finance: totals.finance, installments: totals.installments, summary, transaction };
};

const applyPaymentToInstallment = async ({ installmentId, amount, method, reference, note, paymentDate, createdBy }) => {
  const installment = await Installment.findById(installmentId);
  if (!installment) {
    throw new ErrorHandler('Installment not found', 404);
  }

  const numericAmount = Number(amount || 0);
  if (numericAmount <= 0) {
    throw new ErrorHandler('amount must be greater than 0', 400);
  }

  const paidAmount = (installment.paidAmount || 0) + numericAmount;
  const status = paidAmount >= installment.amount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';

  installment.paidAmount = paidAmount;
  installment.status = status;
  await installment.save();

  await FeeTransaction.create({
    financeId: installment.financeId,
    installmentId: installment._id,
    amount: numericAmount,
    method,
    reference,
    note,
    paymentDate: paymentDate ? new Date(paymentDate) : Date.now(),
    createdBy
  });

  const { finance, installments } = await recalculateTotals(installment.financeId);
  const summary = buildFeeSummary(finance, installments);

  return { finance, installments, summary, installment };
};

const countPaidInstallments = async (financeId) => {
  return Installment.countDocuments({ financeId, status: 'Paid' });
};

module.exports = {
  getFinanceByTarget,
  recalculateTotals,
  applyPaymentToInstallment,
  applyDirectPayment,
  countPaidInstallments,
  buildFeeSummary
};
