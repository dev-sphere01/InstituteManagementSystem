const AdmissionDetails = require('../models/admission');
const StudentStatusHistory = require('../models/studentStatusHistory');

const allowedTransitions = {
  Prospect: ['Applied'],
  Applied: ['Admitted', 'Inactive', 'Dropped'],
  Admitted: ['Active', 'Inactive', 'Dropped'],
  Active: ['Inactive', 'Dropped', 'Completed'],
  Inactive: ['Active', 'Dropped'],
  Dropped: [],
  Completed: []
};

const isValidTransition = (fromStatus, toStatus) => {
  if (!fromStatus) return true;
  const allowed = allowedTransitions[fromStatus] || [];
  return allowed.includes(toStatus);
};

const getStudentStatus = async (admissionId) => {
  const admission = await AdmissionDetails.findById(admissionId).select('studentStatus studentStatusUpdatedAt');
  if (!admission) return null;
  return admission;
};

const updateStudentStatus = async ({ admissionId, toStatus, userId, reason, source }) => {
  const admission = await AdmissionDetails.findById(admissionId);
  if (!admission) {
    const err = new Error('Admission not found');
    err.statusCode = 404;
    throw err;
  }

  const fromStatus = admission.studentStatus || 'Applied';
  if (!isValidTransition(fromStatus, toStatus)) {
    const err = new Error(`Invalid transition from ${fromStatus} to ${toStatus}`);
    err.statusCode = 400;
    throw err;
  }

  admission.studentStatus = toStatus;
  admission.studentStatusUpdatedAt = new Date();
  await admission.save({ validateBeforeSave: false });

  await StudentStatusHistory.create({
    admissionId,
    fromStatus,
    toStatus,
    changedBy: userId,
    reason,
    source
  });

  return admission;
};

const getStatusHistory = async (admissionId) => {
  return StudentStatusHistory.find({ admissionId })
    .populate('changedBy', 'name email')
    .sort({ timestamp: -1 });
};

module.exports = {
  allowedTransitions,
  getStudentStatus,
  updateStudentStatus,
  getStatusHistory
};
