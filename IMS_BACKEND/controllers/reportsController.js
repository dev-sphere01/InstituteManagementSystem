const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const Lead = require('../models/leadModel');
const Branch = require('../models/Branch');
const AdmissionDetails = require('../models/admission');
const Task = require('../models/task');
const FeeTransaction = require('../models/feeTransaction');
const ApplicationFinance = require('../models/applicationFinance');

// ── Daily Leads & Conversions Report ─────────────────────────────────────────
exports.getLeadsReport = catchAsyncErrors(async (req, res) => {
  // Aggregate leads grouped by day
  const dailyLeads = await Lead.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        leads: { $sum: 1 },
        hot: { $sum: { $cond: [{ $eq: ["$stage", "Hot"] }, 1, 0] } },
        warm: { $sum: { $cond: [{ $eq: ["$stage", "Warm"] }, 1, 0] } },
        cold: { $sum: { $cond: [{ $in: ["$stage", ["New", "Contacted"]] }, 1, 0] } },
        conversions: { $sum: { $cond: [{ $eq: ["$stage", "Converted"] }, 1, 0] } }
      }
    }
  ]);

  // Aggregate fee transactions grouped by day
  const dailyRevenue = await FeeTransaction.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
        revenue: { $sum: "$amount" }
      }
    }
  ]);

  const revMap = {};
  dailyRevenue.forEach(r => {
    if (r._id) revMap[r._id] = r.revenue;
  });

  const dates = new Set([
    ...dailyLeads.map(l => l._id),
    ...dailyRevenue.map(r => r._id)
  ].filter(Boolean));

  const combinedLeads = Array.from(dates).map(dateStr => {
    const leadItem = dailyLeads.find(l => l._id === dateStr) || { leads: 0, conversions: 0, hot: 0, warm: 0, cold: 0 };
    return {
      date: dateStr,
      leads: leadItem.leads,
      conversions: leadItem.conversions,
      hot: leadItem.hot,
      warm: leadItem.warm,
      cold: leadItem.cold,
      revenue: revMap[dateStr] || 0
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  res.status(200).json({ success: true, data: combinedLeads });
});

// ── Branch Admissions Summary Report ─────────────────────────────────────────
exports.getBranchesReport = catchAsyncErrors(async (req, res) => {
  const branches = await Branch.find({ isActive: true }).lean();
  const branchAdmissionsList = [];

  for (const branch of branches) {
    const admissions = await AdmissionDetails.find({
      centerCode: branch.branchCode
    }).lean();

    const activeAdmissions = admissions.filter(a => ['Admitted', 'Active'].includes(a.lifecycleStatus));

    // Get finance records
    const activeIds = activeAdmissions.map(a => a._id);
    const finances = await ApplicationFinance.find({
      targetType: 'admission',
      targetId: { $in: activeIds }
    }).lean();

    const totalRevenue = finances.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
    const totalFee = finances.reduce((sum, f) => sum + (f.totalFee || 0), 0);
    const totalDues = totalFee - totalRevenue;

    // Course counts
    const ccc = activeAdmissions.filter(a => a.courseApplied === 'CCC').length;
    const tally = activeAdmissions.filter(a => ['Tally', 'Tally Prime'].includes(a.courseApplied)).length;
    const python = activeAdmissions.filter(a => ['Python', 'Python Web Dev'].includes(a.courseApplied)).length;
    const webdev = activeAdmissions.filter(a => ['Web Dev', 'Graphic Design', 'Web Designing'].includes(a.courseApplied)).length;
    const olevel = activeAdmissions.filter(a => a.courseApplied === 'O Level').length;

    // Target default mapping
    let target = 100;
    if (branch.branchName.toLowerCase().includes('main')) target = 150;
    else if (branch.branchName.toLowerCase().includes('hazratganj')) target = 130;
    else if (branch.branchName.toLowerCase().includes('aliganj')) target = 100;
    else if (branch.branchName.toLowerCase().includes('indira')) target = 90;
    else if (branch.branchName.toLowerCase().includes('noida')) target = 120;

    branchAdmissionsList.push({
      branch: branch.branchName,
      admissions: activeAdmissions.length,
      target,
      revenue: totalRevenue,
      dues: totalDues,
      ccc,
      tally,
      python,
      webdev,
      olevel
    });
  }

  res.status(200).json({ success: true, data: branchAdmissionsList });
});

// ── Back-Office Tasks & Overdue List Report ──────────────────────────────────
exports.getTasksReport = catchAsyncErrors(async (req, res) => {
  const tasks = await Task.find()
    .populate({
      path: 'studentId',
      select: 'fullName centerCode'
    })
    .lean();

  const mappedTasks = tasks.map(t => {
    const isOverdue = t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();
    
    return {
      id: `OT-${t._id.toString().substring(18).toUpperCase()}`,
      title: t.taskName,
      description: `Verification and processing of ${t.taskName} workflow for ${t.studentId?.fullName || 'N/A'}.`,
      deadline: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
      assignedTo: t.assignedRole || 'Staff',
      status: t.status === 'completed' ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
      priority: isOverdue ? 'High' : (t.status === 'in_progress' ? 'Medium' : 'Low'),
      branch: t.studentId?.centerCode || 'Lucknow Main',
      category: t.taskName
    };
  });

  res.status(200).json({ success: true, data: mappedTasks });
});

// ── Fee Collection & Dues Report ─────────────────────────────────────────────
exports.getFeesReport = catchAsyncErrors(async (req, res) => {
  const transactions = await FeeTransaction.find()
    .populate('createdBy', 'name')
    .lean();

  const mappedFees = [];
  for (const tx of transactions) {
    const finance = await ApplicationFinance.findById(tx.financeId).lean();
    if (!finance) continue;

    const admission = await AdmissionDetails.findById(finance.targetId).lean();
    if (!admission) continue;

    mappedFees.push({
      invoiceNo: `INV-${tx._id.toString().substring(18).toUpperCase()}`,
      student: admission.fullName,
      course: admission.courseApplied,
      amountPaid: tx.amount,
      amountDue: finance.totalFee - finance.totalPaid,
      totalAmount: finance.totalFee,
      paymentMode: tx.method || 'Online',
      status: finance.totalPaid >= finance.totalFee ? 'Paid' : (finance.totalPaid > 0 ? 'Partial' : 'Overdue'),
      date: tx.paymentDate ? tx.paymentDate.toISOString().split('T')[0] : null,
      branch: admission.centerCode || 'Lucknow Main'
    });
  }

  res.status(200).json({ success: true, data: mappedFees });
});
