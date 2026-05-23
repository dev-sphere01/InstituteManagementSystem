const Task = require('../models/task');

const DEFAULT_TASKS = [
  { taskName: 'Fee Collection', assignedRole: 'Accountant' },
  { taskName: 'Document Verification', assignedRole: 'Verifier' },
  { taskName: 'Registration', assignedRole: 'Admin' },
  { taskName: 'Exam Form', assignedRole: 'Admin' },
  { taskName: 'Admit Card', assignedRole: 'Admin' },
  { taskName: 'Certificate', assignedRole: 'Admin' }
];

const createLifecycleForAdmission = async ({ admission, userId }) => {
  if (!admission || !admission._id) return { created: false, skipped: true };

  const existingTasks = await Task.findOne({ studentId: admission._id });
  if (existingTasks) return { created: false, skipped: true, instance: null };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // Default due date 1 week

  const tasks = DEFAULT_TASKS.map((t, index) => ({
    studentId: admission._id,
    taskName: t.taskName,
    assignedRole: t.assignedRole,
    status: 'pending',
    isCurrent: index === 0, // Fee Collection is index 0
    dueDate: dueDate
  }));

  await Task.insertMany(tasks);

  return { created: true, skipped: false, instance: null };
};

module.exports = {
  createLifecycleForAdmission
};
