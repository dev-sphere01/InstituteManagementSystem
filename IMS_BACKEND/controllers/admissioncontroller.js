const AdmissionDetails = require('../models/admission');
const ApiFeatures = require("../utils/apiFeatures");
const { createLifecycleForAdmission } = require('../services/studentWorkflowService');

const shouldCreateLifecycle = (admission) => {
  if (!admission) return false;
  return true; // We want all admissions to show up in workflows
};

const ensureLifecycle = async (admission, user) => {
  if (!shouldCreateLifecycle(admission)) return;
  await createLifecycleForAdmission({ admission, userId: user?._id });
};

// Create a new admission
exports.createAdmission = async (req, res) => {
  try {
    const admission = new AdmissionDetails(req.body);
    await admission.save({ validateBeforeSave: false });
    await ensureLifecycle(admission, req.user);
    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all admissions
exports.getAllAdmissions = async (req, res) => {
  try {
    const resultPerPage = Number(req.query.limit) || 10; // dynamic limit from API
    const apiFeature = new ApiFeatures(AdmissionDetails.find(), req.query)
      .search()
      .filter()
      .paginate(resultPerPage);

    const admissions = await apiFeature.query;

    // Total count for frontend pagination control
    const countQuery = new ApiFeatures(AdmissionDetails.find(), req.query).search().filter();
    const totalCount = await countQuery.query.countDocuments();

    res.status(200).json({
      success: true,
      count: admissions.length,
      totalCount,
      page: Number(req.query.page) || 1,
      limit: resultPerPage,
      admissions,
    });
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

// Search admission by formNo, fullName, contactNumber, emailAddress, or aadharNo
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


// Update step-wise (partial save)
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
    await ensureLifecycle(updated, req.user);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Finalize submission
exports.finalizeAdmission = async (req, res) => {
  try {
    const { formNo } = req.params;

    const updated = await AdmissionDetails.findOneAndUpdate(
      { formNo },
      { $set: { isCompleted: true, currentStep: 'submitted', status: 'Submitted', lifecycleStatus: 'Admitted' } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Form not found' });

    // Auto-create Workflow Checklist for the admitted student
    const WorkflowChecklist = require('../models/workflowChecklist');
    const existingChecklist = await WorkflowChecklist.findOne({ admission: updated._id });
    if (!existingChecklist) {
      const baseDate = new Date();
      const defaultTasks = [
        {
          taskType: 'fee_collection',
          title: 'Fee collection and receipt',
          dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
          responsibleTeam: 'Finance',
          status: 'Pending'
        },
        {
          taskType: 'documentation_verification',
          title: 'Documentation verification',
          dueDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
          responsibleTeam: 'Back Office',
          status: 'Pending'
        },
        {
          taskType: 'registration_creation',
          title: 'Registration creation',
          dueDate: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000), // +10 days
          responsibleTeam: 'Back Office',
          status: 'Pending'
        },
        {
          taskType: 'exam_form_filling',
          title: 'Exam form filling',
          dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
          responsibleTeam: 'Academics',
          status: 'Pending'
        },
        {
          taskType: 'admit_card_distribution',
          title: 'Admit card distribution',
          dueDate: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000), // +45 days
          responsibleTeam: 'Academics',
          status: 'Pending'
        },
        {
          taskType: 'certificate_distribution',
          title: 'Certificate distribution',
          dueDate: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000), // +90 days
          responsibleTeam: 'Back Office',
          status: 'Pending'
        }
      ];

      await WorkflowChecklist.create({
        admission: updated._id,
        tasks: defaultTasks
      });
    }

    res.status(200).json({ message: 'Form submitted successfully', data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔄 Manually update student lifecycle status
exports.updateAdmissionLifecycle = async (req, res) => {
  try {
    const { id } = req.params;
    const { lifecycleStatus } = req.body;

    const validStatuses = ['Prospect', 'Applied', 'Admitted', 'Active', 'Inactive', 'Dropped', 'Completed'];
    if (!validStatuses.includes(lifecycleStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid lifecycle status' });
    }

    const updated = await AdmissionDetails.findByIdAndUpdate(
      id,
      { $set: { lifecycleStatus } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student admission not found' });
    }

    res.status(200).json({ success: true, message: 'Lifecycle status updated successfully', admission: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    await ensureLifecycle(updated, req.user);
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

// controllers/admissionController.js
exports.patchAdmission = async (req, res) => {
  try {
    const updated = await AdmissionDetails.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    await ensureLifecycle(updated, req.user);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Patch error:', err);
    res.status(500).json({ message: 'Server error during patch update' });
  }
};

// Upload a file and update admission document
exports.uploadAdmissionFile = async (req, res) => {
  try {
    const id = req.params.id;
    const field = req.params.field;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Build relative path to store in DB
    const folderName = id.slice(-8);
    const filePath = `uploads/${folderName}/${folderName}_${field}${require('path').extname(req.file.originalname)}`;
    // Update the admission document with the file path
    const update = {};
    update[field] = filePath;
    const updated = await AdmissionDetails.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.status(200).json({ message: 'File uploaded', path: filePath, admission: updated });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};
