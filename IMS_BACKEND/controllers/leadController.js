const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const leadService = require('../services/leadService');
const xlsx = require('xlsx');
const multer = require('multer');

// ── Public webhook (no auth) ─────────────────────────────────────────────────
// POST /api/public/leads
exports.publicWebhook = catchAsyncErrors(async (req, res) => {
  const { name, email, phone, source = 'Website', branch, course, campaign, city, notes } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const lead = await leadService.createLead(
    { name, email, phone, source, branch, course, campaign, city, notes },
    null,
    'round-robin'
  );
  res.status(201).json({ success: true, message: 'Lead received', id: lead._id });
});

// ── CRUD ─────────────────────────────────────────────────────────────────────
exports.createLead = catchAsyncErrors(async (req, res) => {
  const lead = await leadService.createLead(req.body, req.user._id, req.body.assignmentMode || 'round-robin');
  res.status(201).json({ success: true, data: lead });
});

exports.getLeads = catchAsyncErrors(async (req, res) => {
  const { page, limit, stage, branch, assignedTo, source, search, isEscalated, campaign } = req.query;
  const result = await leadService.getLeads(
    { stage, branch, assignedTo, source, search, isEscalated, campaign },
    { page, limit }
  );
  res.status(200).json({ success: true, ...result });
});

exports.getLeadById = catchAsyncErrors(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id);
  res.status(200).json({ success: true, data: lead });
});

exports.updateLead = catchAsyncErrors(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, data: lead });
});

exports.deleteLead = catchAsyncErrors(async (req, res) => {
  await leadService.deleteLead(req.params.id);
  res.status(200).json({ success: true, message: 'Lead deleted' });
});

// ── Interactions ─────────────────────────────────────────────────────────────
exports.addInteraction = catchAsyncErrors(async (req, res) => {
  const lead = await leadService.addInteraction(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, data: lead });
});

// ── Reassign ─────────────────────────────────────────────────────────────────
exports.reassignLead = catchAsyncErrors(async (req, res) => {
  const lead = await leadService.reassignLead(req.params.id, req.body.assignedTo, req.user._id);
  res.status(200).json({ success: true, data: lead });
});

// ── Bulk CSV/XLSX import ──────────────────────────────────────────────────────
exports.bulkImport = catchAsyncErrors(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  // Normalize column names (case-insensitive)
  const normalized = rows.map(row => {
    const r = {};
    for (const [k, v] of Object.entries(row)) {
      r[k.toLowerCase().trim().replace(/\s+/g, '_')] = v;
    }
    return {
      name:   r.name || r.full_name || r.fullname || '',
      email:  r.email || '',
      phone:  r.phone || r.mobile || r.contact || '',
      source: r.source || 'CSV Import',
      branch: r.branch || '',
      course: r.course || '',
      city:   r.city || '',
      notes:  r.notes || r.note || '',
    };
  }).filter(r => r.name);

  const result = await leadService.bulkImport(normalized, req.user._id);
  res.status(200).json({ success: true, ...result });
});

// ── Pipeline stats ────────────────────────────────────────────────────────────
exports.getPipelineStats = catchAsyncErrors(async (req, res) => {
  const stats = await leadService.getPipelineStats(req.query);
  res.status(200).json({ success: true, data: stats });
});

// ── Escalation trigger (manual or cron) ──────────────────────────────────────
exports.runEscalationCheck = catchAsyncErrors(async (req, res) => {
  const count = await leadService.checkEscalations();
  res.status(200).json({ success: true, escalated: count });
});
