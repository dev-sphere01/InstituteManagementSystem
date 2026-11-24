const ApplicationFinance = require('../models/applicationFinance');
const Installment = require('../models/installment');
const FeeTransaction = require('../models/feeTransaction');
const ErrorHandler = require('../utils/ErrorHandler');
const Course = require('../models/courses');
const AdmissionDetails = require('../models/admission');

const getFinanceByTarget = async (targetType, targetId) => {
  if (!targetType || !targetId) {
    throw new ErrorHandler('targetType and targetId are required', 400);
  }

  let finance = await ApplicationFinance.findOne({ targetType, targetId });

  // Map course fee if totalFee is 0 or finance record is missing
  if (targetType === 'admission') {
    try {
      const admission = await AdmissionDetails.findById(targetId).select('courseApplied');
      if (admission && admission.courseApplied) {
        const escapedCourse = admission.courseApplied.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const course = await Course.findOne({
          $or: [
            { courseName: { $regex: new RegExp(`^${escapedCourse}$`, 'i') } },
            { courseCode: admission.courseApplied }
          ]
        });

        if (course && Number(course.fee) > 0) {
          if (!finance) {
            finance = await ApplicationFinance.create({
              targetType: 'admission',
              targetId,
              totalFee: Number(course.fee),
              totalPaid: 0,
              currency: 'INR'
            });
          } else if (!finance.totalFee || Number(finance.totalFee) === 0) {
            finance.totalFee = Number(course.fee);
            await finance.save();
          }

          // If EMI is enabled on course, auto-generate default installments if none exist
          if (course.enableEmi && course.maxEmiInstallments > 1) {
            const existingInstallmentsCount = await Installment.countDocuments({ financeId: finance._id });
            if (existingInstallmentsCount === 0) {
              const count = Number(course.maxEmiInstallments);
              const emiVal = Number(course.emiAmount) || Math.ceil(Number(course.fee) / count);
              const baseDate = new Date();
              const installmentDocs = [];
              let totalAllocated = 0;

              for (let i = 0; i < count; i++) {
                let instAmount = emiVal;
                if (i === count - 1) {
                  instAmount = Math.max(0, Number(course.fee) - totalAllocated);
                }
                totalAllocated += instAmount;
                const dueDate = new Date(baseDate);
                dueDate.setDate(dueDate.getDate() + 30 * (i + 1));

                installmentDocs.push({
                  financeId: finance._id,
                  installmentNo: i + 1,
                  amount: instAmount,
                  dueDate,
                  paidAmount: 0,
                  status: 'Pending'
                });
              }

              if (installmentDocs.length > 0) {
                await Installment.insertMany(installmentDocs);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error mapping course fee to admission finance:', err);
    }
  }

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
  const remainingAmount = Math.max(0, totalFee - totalPaid);
  const percentage = totalFee > 0 ? Math.round((totalPaid / totalFee) * 10000) / 100 : 0;
  const paidInstallments = installments.filter((i) => i.status === 'Paid').length;
  return {
    totalFee,
    paidAmount,
    remainingAmount,
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
