const WorkflowChecklist = require('../models/workflowChecklist');
const AdmissionDetails = require('../models/admission');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Helper to initialize standard post-admission tasks with default offset due dates
const initializeDefaultChecklist = async (admissionId, admissionDate) => {
  const baseDate = admissionDate ? new Date(admissionDate) : new Date();

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

  const checklist = new WorkflowChecklist({
    admission: admissionId,
    tasks: defaultTasks
  });

  await checklist.save();
  return checklist;
};

// Dynamically check and update overdue tasks on query/read
const updateOverdueStatuses = async (workflow) => {
  const now = new Date();
  let modified = false;

  workflow.tasks.forEach((task) => {
    if (task.status !== 'Done' && now > task.dueDate) {
      if (task.status !== 'Overdue') {
        task.status = 'Overdue';
        modified = true;
      }
    }
  });

  if (modified) {
    await workflow.save();
  }
  return workflow;
};

// @desc    Get all student workflows with filters & search
// @route   GET /api/v1/workflows
// @access  Private
exports.getAllWorkflows = async (req, res) => {
  try {
    const { keyword, status, lifecycleStatus, page = 1, limit = 10 } = req.query;
    const resultPerPage = Number(limit);
    const skip = resultPerPage * (Number(page) - 1);

    let admissionFilter = {};

    // Filter by student details if keyword is provided
    if (keyword) {
      const searchRegex = new RegExp(keyword, 'i');
      const matchingAdmissions = await AdmissionDetails.find({
        $or: [
          { fullName: searchRegex },
          { emailAddress: searchRegex },
          { contactNumber: searchRegex },
          { generatedRegNo: searchRegex },
          { formNo: searchRegex },
          { courseApplied: searchRegex }
        ]
      }).select('_id');
      const admissionIds = matchingAdmissions.map(a => a._id);
      admissionFilter.admission = { $in: admissionIds };
    }

    // Filter by lifecycleStatus
    if (lifecycleStatus) {
      const matchingAdmissions = await AdmissionDetails.find({ lifecycleStatus }).select('_id');
      const admissionIds = matchingAdmissions.map(a => a._id);

      if (admissionFilter.admission) {
        // Find intersection
        const existingIds = admissionFilter.admission.$in.map(id => id.toString());
        const filteredIds = admissionIds.filter(id => existingIds.includes(id.toString()));
        admissionFilter.admission = { $in: filteredIds };
      } else {
        admissionFilter.admission = { $in: admissionIds };
      }
    }

    let query = {};
    if (admissionFilter.admission) {
      query.admission = admissionFilter.admission;
    }

    // Filter by task status inside tasks array
    if (status) {
      query['tasks.status'] = status;
    }

    const totalCount = await WorkflowChecklist.countDocuments(query);
    let workflows = await WorkflowChecklist.find(query)
      .populate('admission')
      .populate('tasks.responsiblePerson', 'name email phone avatar')
      .populate('tasks.escalationRules.escalatedTo', 'name email')
      .skip(skip)
      .limit(resultPerPage);

    // Dynamic overdue check & save on retrieved workflows
    for (let i = 0; i < workflows.length; i++) {
      workflows[i] = await updateOverdueStatuses(workflows[i]);
    }

    res.status(200).json({
      success: true,
      count: workflows.length,
      totalCount,
      page: Number(page),
      limit: resultPerPage,
      workflows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or auto-initialize workflow for a specific admission
// @route   GET /api/v1/workflows/admission/:admissionId
// @access  Private
exports.getWorkflowByAdmission = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await AdmissionDetails.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission details not found' });
    }

    let workflow = await WorkflowChecklist.findOne({ admission: admissionId })
      .populate('admission')
      .populate('tasks.responsiblePerson', 'name email phone')
      .populate('tasks.escalationRules.escalatedTo', 'name email');

    // Auto-create a default checklist if one doesn't exist
    if (!workflow) {
      workflow = await initializeDefaultChecklist(admissionId, admission.createdAt || admission.timestamp);
      workflow = await WorkflowChecklist.findById(workflow._id).populate('admission').populate('tasks.responsiblePerson', 'name email phone');
    }

    // Dynamic overdue status validation
    workflow = await updateOverdueStatuses(workflow);

    res.status(200).json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a specific task in a checklist
// @route   PATCH /api/v1/workflows/:id/tasks/:taskId
// @access  Private
exports.updateWorkflowTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { status, dueDate, responsiblePerson, responsibleTeam, gracePeriodDays } = req.body;

    const workflow = await WorkflowChecklist.findById(id).populate('admission');
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow checklist not found' });
    }

    const task = workflow.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Checklist task not found' });
    }

    // Apply updates
    if (status !== undefined) {
      task.status = status;
      if (status === 'Done') {
        task.completedAt = new Date();
        task.completedBy = req.user ? req.user.name : 'System';
      } else {
        task.completedAt = undefined;
        task.completedBy = undefined;
      }
    }

    if (dueDate !== undefined) {
      task.dueDate = new Date(dueDate);
    }

    if (responsiblePerson !== undefined) {
      task.responsiblePerson = responsiblePerson || null;
    }

    if (responsibleTeam !== undefined) {
      task.responsibleTeam = responsibleTeam;
    }

    if (gracePeriodDays !== undefined && task.escalationRules) {
      task.escalationRules.gracePeriodDays = gracePeriodDays;
    }

    await workflow.save();

    // Trigger auto-lifecycle transitions if task is marked Done
    if (status === 'Done' && workflow.admission) {
      const admission = await AdmissionDetails.findById(workflow.admission._id);
      if (admission) {
        const feesTask = workflow.tasks.find(t => t.taskType === 'fee_collection');
        const docsTask = workflow.tasks.find(t => t.taskType === 'documentation_verification');
        const certsTask = workflow.tasks.find(t => t.taskType === 'certificate_distribution');

        let originalStatus = admission.lifecycleStatus;
        let updatedStatus = originalStatus;

        // Transition 1: fee_collection and documentation_verification marked Done -> Active
        if (feesTask.status === 'Done' && docsTask.status === 'Done') {
          if (originalStatus === 'Admitted' || originalStatus === 'Applied') {
            updatedStatus = 'Active';
          }
        }

        // Transition 2: certificate_distribution marked Done -> Completed
        if (certsTask.status === 'Done') {
          updatedStatus = 'Completed';
        }

        if (updatedStatus !== originalStatus) {
          admission.lifecycleStatus = updatedStatus;
          await admission.save();
        }
      }
    }

    const updatedWorkflow = await WorkflowChecklist.findById(id)
      .populate('admission')
      .populate('tasks.responsiblePerson', 'name email phone')
      .populate('tasks.escalationRules.escalatedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      workflow: updatedWorkflow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send manual email reminder to staff or student
// @route   POST /api/v1/workflows/:id/reminders
// @access  Private
exports.sendManualReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, taskId, customMessage } = req.body;

    const workflow = await WorkflowChecklist.findById(id).populate('admission');
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow checklist not found' });
    }

    const task = workflow.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Checklist task not found' });
    }

    let recipientEmail = '';
    let recipientName = '';
    let subject = '';
    let messageHtml = '';

    if (type === 'staff') {
      if (!task.responsiblePerson) {
        // Find a back-office staff if no assignee is set
        const staffUser = await User.findOne({ role: 'admin' }); // default admin fallback
        if (staffUser) {
          recipientEmail = staffUser.email;
          recipientName = staffUser.name;
        } else {
          return res.status(400).json({ success: false, message: 'No responsible staff assigned to this task' });
        }
      } else {
        const staff = await User.findById(task.responsiblePerson);
        if (staff) {
          recipientEmail = staff.email;
          recipientName = staff.name;
        }
      }

      subject = `[URGENT REMINDER] Pending Task: ${task.title}`;
      messageHtml = `
        <h3>Dear ${recipientName},</h3>
        <p>This is a reminder that you have a pending task assigned to you in the Institute Management System:</p>
        <table border="1" cellpadding="6" style="border-collapse:collapse;">
          <tr><td><b>Student:</b></td><td>${workflow.admission.fullName} (${workflow.admission.generatedRegNo || workflow.admission.formNo})</td></tr>
          <tr><td><b>Task:</b></td><td>${task.title}</td></tr>
          <tr><td><b>Due Date:</b></td><td>${new Date(task.dueDate).toDateString()}</td></tr>
          <tr><td><b>Status:</b></td><td>${task.status}</td></tr>
        </table>
        <p>${customMessage || 'Please log in to the IMS Dashboard and mark the task as complete once finalized.'}</p>
        <br/>
        <p>Thank you,</p>
        <p><b>IMS Administration System</b></p>
      `;
    } else if (type === 'student') {
      if (!workflow.admission.emailAddress) {
        return res.status(400).json({ success: false, message: 'Student does not have an email address registered' });
      }
      recipientEmail = workflow.admission.emailAddress;
      recipientName = workflow.admission.fullName;

      subject = `[IMS Onboarding Reminder] Pending ${task.title}`;
      messageHtml = `
        <h3>Dear ${recipientName},</h3>
        <p>We hope you are having a wonderful day!</p>
        <p>This is a polite reminder regarding your pending onboarding steps at our Institute:</p>
        <p><b>Pending Step:</b> ${task.title}</p>
        <p>${customMessage || 'Please coordinate with the back office team or visit our administration portal to complete this step.'}</p>
        <br/>
        <p>Should you have any questions, feel free to reply directly to this email or reach us at ${workflow.admission.centerCode || 'our support line'}.</p>
        <br/>
        <p>Best regards,</p>
        <p><b>Administration Desk</b></p>
      `;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid recipient type' });
    }

    const emailStatus = await sendEmail(recipientEmail, subject, messageHtml);
    
    // Log reminder dispatch
    task.remindersSent.push({
      type,
      message: customMessage || `Reminder email regarding ${task.title} sent.`,
      sentAt: new Date()
    });

    await workflow.save();

    res.status(200).json({
      success: true,
      message: `Reminder sent successfully to ${type} (${recipientEmail})`,
      emailStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalate an overdue task to a manager
// @route   POST /api/v1/workflows/:id/tasks/:taskId/escalate
// @access  Private
exports.escalateTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { escalatedToUserId, escalationReason } = req.body;

    const workflow = await WorkflowChecklist.findById(id).populate('admission');
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow checklist not found' });
    }

    const task = workflow.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Checklist task not found' });
    }

    const manager = await User.findById(escalatedToUserId);
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager user not found for escalation' });
    }

    // Set escalation rules
    task.escalationRules.isEscalated = true;
    task.escalationRules.escalatedTo = manager._id;
    task.escalationRules.escalationReason = escalationReason || 'Overdue checklist task requiring supervisor attention.';

    await workflow.save();

    // Send Escalation Email Notification to Manager
    const subject = `[TASK ESCALATION] Overdue Post-Admission Task: ${task.title}`;
    const messageHtml = `
      <h3>Dear ${manager.name},</h3>
      <p>This is a formal notification that a post-admission onboarding task has exceeded its deadline and has been escalated to you for supervisor oversight.</p>
      <table border="1" cellpadding="6" style="border-collapse:collapse;">
        <tr><td><b>Student:</b></td><td>${workflow.admission.fullName} (${workflow.admission.generatedRegNo || workflow.admission.formNo})</td></tr>
        <tr><td><b>Task Name:</b></td><td>${task.title}</td></tr>
        <tr><td><b>Task Due Date:</b></td><td>${new Date(task.dueDate).toDateString()}</td></tr>
        <tr><td><b>Current Status:</b></td><td><span style="color:red; font-weight:bold;">${task.status}</span></td></tr>
        <tr><td><b>Escalation Reason:</b></td><td>${task.escalationRules.escalationReason}</td></tr>
      </table>
      <p>Please review the workflow, verify if there are blockers, and resolve the checklist item at your earliest convenience.</p>
      <br/>
      <p>Warm regards,</p>
      <p><b>IMS Alert Notification Engine</b></p>
    `;

    const emailStatus = await sendEmail(manager.email, subject, messageHtml);

    const updatedWorkflow = await WorkflowChecklist.findById(id)
      .populate('admission')
      .populate('tasks.responsiblePerson', 'name email phone')
      .populate('tasks.escalationRules.escalatedTo', 'name email');

    res.status(200).json({
      success: true,
      message: `Task successfully escalated to ${manager.name}`,
      emailStatus,
      workflow: updatedWorkflow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
