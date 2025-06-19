const AdmissionDetails = require('../models/admission');

// Create a new admission
exports.createAdmission = async (req, res) => {
  try {
    const admission = new AdmissionDetails(req.body);
    const savedAdmission = await admission.save();
    res.status(201).json(savedAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all admissions
exports.getAllAdmissions = async (req, res) => {
  try {
    const admissions = await AdmissionDetails.find();
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one admission by ID
exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await AdmissionDetails.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update admission
exports.updateAdmission = async (req, res) => {
  try {
    const updatedAdmission = await AdmissionDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAdmission) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(updatedAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete admission
exports.deleteAdmission = async (req, res) => {
  try {
    const deletedAdmission = await AdmissionDetails.findByIdAndDelete(req.params.id);
    if (!deletedAdmission) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
