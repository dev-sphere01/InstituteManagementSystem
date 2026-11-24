const { runEscalationCycle } = require('../services/escalationService');
const { runOverdueJob } = require('../services/overdueJob');

exports.runEscalations = async (req, res) => {
  try {
    const result = await runEscalationCycle();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.runOverdueCheck = async (req, res) => {
  try {
    await runOverdueJob();
    return res.status(200).json({ success: true, message: 'Overdue check completed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
