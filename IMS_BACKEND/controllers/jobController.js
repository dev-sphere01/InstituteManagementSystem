const { runEscalationCycle } = require('../services/escalationService');

exports.runEscalations = async (req, res) => {
  try {
    const result = await runEscalationCycle();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
