const Lead = require('../models/leadModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/ErrorHandler');

// ── Deduplication ────────────────────────────────────────────────────────────
async function findDuplicate(email, phone, excludeId = null) {
  const orClauses = [];
  if (email) orClauses.push({ email });
  if (phone) orClauses.push({ phone });
  if (!orClauses.length) return null;

  const query = { $or: orClauses };
  if (excludeId) query._id = { $ne: excludeId };
  return await Lead.findOne(query).select('_id name email phone');
}

// ── Round-Robin Assignment ───────────────────────────────────────────────────
let rrIndex = 0;

async function getCounselorIds() {
  // Since role is an ObjectId ref (not a string), just get all active users
  const users = await User.find({ isActive: true }).select('_id').lean();
  return users.map(u => u._id);
}

async function assignRoundRobin() {
  const ids = await getCounselorIds();
  if (!ids.length) return null;
  const assigned = ids[rrIndex % ids.length];
  rrIndex++;
  return assigned;
}

async function assignLeastLoaded() {
  const ids = await getCounselorIds();
  if (!ids.length) return null;

  const counts = await Lead.aggregate([
    { $match: { assignedTo: { $in: ids }, stage: { $nin: ['Converted', 'Lost'] } } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
  ]);

  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
  let minCount = Infinity, chosen = ids[0];
  for (const id of ids) {
    const c = countMap[id.toString()] || 0;
    if (c < minCount) { minCount = c; chosen = id; }
  }
  return chosen;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
exports.createLead = async (data, createdBy, assignmentMode = 'round-robin') => {
  // Dedup check
  const dup = await findDuplicate(data.email, data.phone);
  if (dup) {
    data.isDuplicate = true;
    data.duplicateOf = dup._id;
  }

  // Auto-assign only if not manually specified
  let assignedTo = data.assignedTo || null;
  if (!assignedTo) {
    try {
      assignedTo = assignmentMode === 'least-loaded'
        ? await assignLeastLoaded()
        : await assignRoundRobin();
    } catch (e) {
      // Assignment failure should never block lead creation
      assignedTo = null;
    }
  }

  const lead = await Lead.create({
    ...data,
    assignedTo,
    assignedAt: assignedTo ? new Date() : null,
    createdBy: createdBy || null,
    lastInteractionAt: new Date(),
    interactions: [{
      type: 'Note',
      note: `Lead created from ${data.source || 'Unknown'}`,
      createdBy: createdBy || null,
    }]
  });

  return lead;
};

exports.getLeads = async (filters = {}, pagination = {}) => {
  const { stage, branch, assignedTo, source, search, isEscalated, campaign } = filters;
  const { page = 1, limit = 20 } = pagination;

  const query = {};
  if (stage)       query.stage = stage;
  if (branch)      query.branch = branch;
  if (assignedTo)  query.assignedTo = assignedTo;
  if (source)      query.source = source;
  if (campaign)    query.campaign = campaign;
  if (isEscalated !== undefined) query.isEscalated = isEscalated === 'true';
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('campaign', 'name channel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit)
      .lean(),
    Lead.countDocuments(query)
  ]);

  return { leads, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
};

exports.getLeadById = async (id) => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email')
    .populate('campaign', 'name channel')
    .populate('interactions.createdBy', 'name')
    .populate('duplicateOf', 'name email phone');
  if (!lead) throw new ErrorHandler('Lead not found', 404);
  return lead;
};

exports.updateLead = async (id, data, userId) => {
  const lead = await Lead.findById(id);
  if (!lead) throw new ErrorHandler('Lead not found', 404);

  const interactions = [];

  // Track stage change
  if (data.stage && data.stage !== lead.stage) {
    interactions.push({ type: 'Stage Change', note: `Stage changed from ${lead.stage} to ${data.stage}`, createdBy: userId });
  }

  // Track reassignment
  if (data.assignedTo && data.assignedTo.toString() !== lead.assignedTo?.toString()) {
    interactions.push({ type: 'Assignment', note: `Lead reassigned`, createdBy: userId });
    data.assignedAt = new Date();
  }

  Object.assign(lead, data);
  if (interactions.length) lead.interactions.push(...interactions);
  lead.lastInteractionAt = new Date();
  await lead.save();
  return lead;
};

exports.deleteLead = async (id) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new ErrorHandler('Lead not found', 404);
  return lead;
};

exports.addInteraction = async (leadId, interaction, userId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new ErrorHandler('Lead not found', 404);
  lead.interactions.push({ ...interaction, createdBy: userId });
  lead.lastInteractionAt = new Date();
  await lead.save();
  return lead;
};

exports.reassignLead = async (leadId, newAssigneeId, userId) => {
  return exports.updateLead(leadId, { assignedTo: newAssigneeId }, userId);
};

// ── Bulk Import ──────────────────────────────────────────────────────────────
exports.bulkImport = async (rows, createdBy) => {
  const results = { imported: 0, duplicates: 0, errors: [] };

  for (const row of rows) {
    try {
      const dup = await findDuplicate(row.email, row.phone);
      if (dup) {
        row.isDuplicate = true;
        row.duplicateOf = dup._id;
        results.duplicates++;
      }
      await Lead.create({ ...row, createdBy, lastInteractionAt: new Date() });
      results.imported++;
    } catch (e) {
      results.errors.push({ row, error: e.message });
    }
  }
  return results;
};

// ── Escalation check (called by scheduled job) ───────────────────────────────
exports.checkEscalations = async () => {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
  const result = await Lead.updateMany(
    {
      stage: 'Hot',
      isEscalated: false,
      $or: [
        { lastInteractionAt: { $lt: threshold } },
        { lastInteractionAt: null }
      ]
    },
    { $set: { isEscalated: true, escalatedAt: new Date() } }
  );
  return result.modifiedCount;
};

// ── Pipeline stats ────────────────────────────────────────────────────────────
exports.getPipelineStats = async (filters = {}) => {
  const match = {};
  if (filters.branch) match.branch = filters.branch;
  if (filters.assignedTo) match.assignedTo = new (require('mongoose').Types.ObjectId)(filters.assignedTo);

  const stages = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$stage', count: { $sum: 1 } } }
  ]);

  const sources = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);

  const daily = await Lead.aggregate([
    { $match: { ...match, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return { stages, sources, daily };
};
