const AdmissionDetails = require('../models/admission');

// Create a new admission
exports.createAdmission = async (req, res) => {
  try {
    const admission = new AdmissionDetails(req.body);
    await admission.save({ validateBeforeSave: false }); // disables full schema validation
    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// Get one admission by MongoDB ID
exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await AdmissionDetails.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Search admission by formNo, fullName, contactNumber, emailAddress, or aadharNo
exports.searchAdmission = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const searchRegex = new RegExp(query, 'i'); // Case-insensitive partial match

    const result = await AdmissionDetails.findOne({
      $or: [
        { formNo: searchRegex },
        { fullName: searchRegex },
        { contactNumber: searchRegex },
        { emailAddress: searchRegex },
        { aadharNo: searchRegex }
      ]
    });

    if (!result) {
      return res.status(404).json({ message: 'No matching record found' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✏️ Update step-wise (partial save)
exports.updateAdmissionStep = async (req, res) => {
  try {
    const { formNo } = req.params;
    const { currentStep, ...partialData } = req.body;

    const updated = await AdmissionDetails.findOneAndUpdate(
      { formNo },
      {
        $set: {
          ...partialData,
          currentStep: currentStep || 'basic'
        }
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Finalize submission
exports.finalizeAdmission = async (req, res) => {
  try {
    const { formNo } = req.params;

    const updated = await AdmissionDetails.findOneAndUpdate(
      { formNo },
      { $set: { isCompleted: true, currentStep: 'submitted', status: 'Submitted' } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Form submitted successfully', data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update full admission (by MongoDB ID)
exports.updateAdmission = async (req, res) => {
  try {
    const updated = await AdmissionDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: false, // disables schema validation on update
      }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Delete admission by ID
exports.deleteAdmission = async (req, res) => {
  try {
    const deletedAdmission = await AdmissionDetails.findByIdAndDelete(req.params.id);
    if (!deletedAdmission) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
