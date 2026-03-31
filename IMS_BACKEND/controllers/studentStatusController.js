const {
  getStudentStatus,
  updateStudentStatus,
  getStatusHistory
} = require('../services/studentStatusService');

exports.getStatus = async (req, res) => {
  try {
    const admission = await getStudentStatus(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    return res.status(200).json({
      success: true,
      data: {
        studentStatus: admission.studentStatus,
        studentStatusUpdatedAt: admission.studentStatusUpdatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, reason, source } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });

    const admission = await updateStudentStatus({
      admissionId: req.params.id,
      toStatus: status,
      userId: req.user ? req.user._id : undefined,
      reason,
      source
    });

    return res.status(200).json({
      success: true,
      data: {
        studentStatus: admission.studentStatus,
        studentStatusUpdatedAt: admission.studentStatusUpdatedAt
      }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await getStatusHistory(req.params.id);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
