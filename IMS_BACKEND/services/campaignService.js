const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const AdmissionDetails = require('../models/admission');
const ApplicationFinance = require('../models/applicationFinance');
const ErrorHandler = require('../utils/ErrorHandler');

exports.createCampaign = async (data, userId) => {
  return await Campaign.create({ ...data, createdBy: userId });
};

exports.getCampaigns = async (filters = {}) => {
  const query = {};
  if (filters.channel) query.channel = filters.channel;
  if (filters.branch)  query.branch  = filters.branch;
  if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
  return await Campaign.find(query).sort({ createdAt: -1 }).lean();
};

exports.getCampaignById = async (id) => {
  const c = await Campaign.findById(id);
  if (!c) throw new ErrorHandler('Campaign not found', 404);
  return c;
};

exports.updateCampaign = async (id, data) => {
  const c = await Campaign.findByIdAndUpdate(id, data, { new: true });
  if (!c) throw new ErrorHandler('Campaign not found', 404);
  return c;
};

exports.deleteCampaign = async (id) => {
  const c = await Campaign.findByIdAndDelete(id);
  if (!c) throw new ErrorHandler('Campaign not found', 404);
  return c;
};

// ROI Analytics
exports.getCampaignROI = async (filters = {}) => {
  const campaignMatch = {};
  if (filters.branch) campaignMatch.branch = filters.branch;

  const campaigns = await Campaign.find(campaignMatch).lean();
  const campaignIds = campaigns.map(c => c._id);

  // Leads per campaign
  const leadCounts = await Lead.aggregate([
    { $match: { campaign: { $in: campaignIds } } },
    { $group: { _id: '$campaign', totalLeads: { $sum: 1 } } }
  ]);

  // Conversions per campaign
  const conversionCounts = await Lead.aggregate([
    { $match: { campaign: { $in: campaignIds }, stage: 'Converted' } },
    { $group: { _id: '$campaign', conversions: { $sum: 1 } } }
  ]);

  const leadMap = Object.fromEntries(leadCounts.map(l => [l._id.toString(), l.totalLeads]));
  const convMap = Object.fromEntries(conversionCounts.map(c => [c._id.toString(), c.conversions]));

  // Aggregate actual campaign revenue by matching converted leads to admissions billing
  const convertedLeads = await Lead.find({ campaign: { $in: campaignIds }, stage: 'Converted' }).select('campaign email phone').lean();
  const emails = convertedLeads.map(l => l.email).filter(Boolean);
  const phones = convertedLeads.map(l => l.phone).filter(Boolean);

  const admissions = await AdmissionDetails.find({
    $or: [
      { emailAddress: { $in: emails } },
      { contactNumber: { $in: phones } }
    ]
  }).select('_id emailAddress contactNumber').lean();

  const admissionIds = admissions.map(a => a._id);
  const finances = await ApplicationFinance.find({
    targetType: 'admission',
    targetId: { $in: admissionIds }
  }).select('targetId totalPaid').lean();

  const financeMap = {};
  finances.forEach(f => {
    financeMap[f.targetId.toString()] = f.totalPaid || 0;
  });

  const studentPaidMap = {};
  admissions.forEach(a => {
    const paid = financeMap[a._id.toString()] || 0;
    if (a.emailAddress) studentPaidMap[a.emailAddress.toLowerCase()] = paid;
    if (a.contactNumber) studentPaidMap[a.contactNumber] = paid;
  });

  const campaignRevenueMap = {};
  campaignIds.forEach(id => {
    campaignRevenueMap[id.toString()] = 0;
  });

  convertedLeads.forEach(l => {
    if (l.campaign) {
      const emailPaid = l.email ? studentPaidMap[l.email.toLowerCase()] : 0;
      const phonePaid = l.phone ? studentPaidMap[l.phone] : 0;
      const paid = Math.max(emailPaid, phonePaid);
      const campId = l.campaign.toString();
      campaignRevenueMap[campId] = (campaignRevenueMap[campId] || 0) + (paid || 6000);
    }
  });

  return campaigns.map(c => {
    const id = c._id.toString();
    const totalLeads   = leadMap[id] || 0;
    const conversions  = convMap[id] || 0;
    const cpl = totalLeads > 0 ? (c.budget / totalLeads).toFixed(2) : null;
    const cpa = conversions > 0 ? (c.budget / conversions).toFixed(2) : null;
    const convRate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : '0.0';
    const revenue = campaignRevenueMap[id] || (conversions * 6000);

    return {
      ...c,
      campaignName: c.name,
      totalLeads,
      leads: totalLeads,
      conversions,
      cpl: cpl ? +cpl : null,
      cpa: cpa ? +cpa : null,
      conversionRate: +convRate,
      revenue
    };
  });
};

// Overall ROI dashboard stats
exports.getOverallROI = async () => {
  const [totalLeads, converted, totalBudget] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ stage: 'Converted' }),
    Campaign.aggregate([{ $group: { _id: null, total: { $sum: '$budget' } } }])
  ]);

  const budget = totalBudget[0]?.total || 0;
  return {
    totalLeads,
    converted,
    conversionRate: totalLeads > 0 ? +((converted / totalLeads) * 100).toFixed(1) : 0,
    totalSpend: budget,
    cpl: totalLeads > 0 ? +(budget / totalLeads).toFixed(2) : null,
    cpa: converted > 0 ? +(budget / converted).toFixed(2) : null,
  };
};
