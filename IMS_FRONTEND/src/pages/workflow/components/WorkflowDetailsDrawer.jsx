import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, User, Mail, AlertTriangle, 
  CheckCircle, Clock, Send, ShieldAlert, Check, Play 
} from 'lucide-react';
import API from '../../../services/API';
import { useNotification } from '../../../services/NotificationService';

const WorkflowDetailsDrawer = ({ isOpen, onClose, admissionId, onWorkflowUpdated }) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  
  // Reminders State
  const [reminderModal, setReminderModal] = useState({
    isOpen: false,
    task: null,
    type: 'staff', // 'staff' | 'student'
    message: ''
  });
  const [sendingReminder, setSendingReminder] = useState(false);

  // Escalation State
  const [escalationModal, setEscalationModal] = useState({
    isOpen: false,
    task: null,
    escalatedToUserId: '',
    reason: ''
  });
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  const notify = useNotification();

  // Fetch workflow details
  const fetchWorkflow = async () => {
    if (!admissionId) return;
    setLoading(true);
    try {
      const res = await API.workflows.getByAdmissionId(admissionId);
      if (res.success && res.workflow) {
        setWorkflow(res.workflow);
      }
    } catch (err) {
      console.error('Failed to load workflow', err);
      notify('Failed to load workflow details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const res = await API.users.getAll({ limit: 100 });
      const usersList = res.data || res.users || [];
      // Filter out non-admin/staff role users if roles exist, or display all
      setStaff(usersList);
    } catch (err) {
      console.error('Failed to fetch staff users', err);
    }
  };

  useEffect(() => {
    if (isOpen && admissionId) {
      fetchWorkflow();
      fetchStaff();
    }
  }, [isOpen, admissionId]);

  if (!isOpen) return null;

  // Handle simple field updates (status, dueDate, responsiblePerson, responsibleTeam)
  const handleUpdateTaskField = async (taskId, fields) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await API.workflows.updateTask(workflow._id, taskId, fields);
      if (res.success && res.workflow) {
        setWorkflow(res.workflow);
        notify('Task updated successfully!', 'success');
        if (onWorkflowUpdated) {
          onWorkflowUpdated();
        }
      }
    } catch (err) {
      console.error('Failed to update task', err);
      notify(err.response?.data?.message || 'Failed to update task', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Trigger manual reminder
  const handleSendReminder = async () => {
    const { task, type, message } = reminderModal;
    if (!task) return;
    
    setSendingReminder(true);
    try {
      await API.workflows.sendReminder(workflow._id, {
        type,
        taskId: task._id,
        customMessage: message
      });
      notify(`Email reminder sent successfully to ${type === 'staff' ? 'assigned staff' : 'student'}!`, 'success');
      setReminderModal({ isOpen: false, task: null, type: 'staff', message: '' });
      fetchWorkflow(); // Refresh to log the sent reminder
    } catch (err) {
      console.error('Failed to send reminder', err);
      notify(err.response?.data?.message || 'Failed to send reminder email', 'error');
    } finally {
      setSendingReminder(false);
    }
  };

  // Submit escalation
  const handleEscalateTask = async () => {
    const { task, escalatedToUserId, reason } = escalationModal;
    if (!task || !escalatedToUserId) {
      notify('Please select a manager for escalation', 'warning');
      return;
    }

    setSubmittingEscalation(true);
    try {
      const res = await API.workflows.escalateTask(workflow._id, task._id, {
        escalatedToUserId,
        escalationReason: reason
      });
      if (res.success && res.workflow) {
        setWorkflow(res.workflow);
        notify(`Task successfully escalated to manager!`, 'success');
        setEscalationModal({ isOpen: false, task: null, escalatedToUserId: '', reason: '' });
        if (onWorkflowUpdated) {
          onWorkflowUpdated();
        }
      }
    } catch (err) {
      console.error('Failed to escalate task', err);
      notify(err.response?.data?.message || 'Failed to escalate task', 'error');
    } finally {
      setSubmittingEscalation(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/25';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/25 animate-pulse';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/25';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin-slow" />;
      case 'Overdue':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 border-l border-slate-200/50 dark:border-slate-800">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Onboarding Workflow
            </span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
              {loading ? 'Loading...' : workflow?.admission?.fullName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reg No/Form No: {workflow?.admission?.generatedRegNo || workflow?.admission?.formNo || 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-slate-500">Loading student checklist...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Quick Details Bar */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                    Course Enrolled
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {workflow?.admission?.courseApplied || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                    Lifecycle Status
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {workflow?.admission?.lifecycleStatus || 'Admitted'}
                  </span>
                </div>
              </div>

              {/* Tasks Checklist Title */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  Onboarding Stages (6)
                </h3>

                <div className="space-y-4">
                  {workflow?.tasks?.map((task, idx) => {
                    const isTaskUpdating = updatingTaskId === task._id;
                    const overdue = task.status === 'Overdue';
                    
                    return (
                      <div 
                        key={task._id}
                        className={`border rounded-xl p-4 transition-all duration-200 relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                          overdue 
                            ? 'border-rose-200 dark:border-rose-950/60 bg-rose-50/10' 
                            : 'border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {/* Upper row: status, title and controls */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {idx + 1}. {task.title}
                              </h4>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Team: {task.responsibleTeam}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle quick actions */}
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskField(task._id, { status: e.target.value })}
                              disabled={isTaskUpdating}
                              className={`text-xs px-2.5 py-1 rounded-full border focus:outline-none font-semibold ${getStatusStyle(task.status)} cursor-pointer`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                              <option value="Overdue">Overdue</option>
                            </select>
                          </div>
                        </div>

                        {/* Middle Row: Assignee & Due Date Picker */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          
                          {/* Assignee */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                              Assigned Staff
                            </label>
                            <select
                              value={task.responsiblePerson?._id || ''}
                              onChange={(e) => handleUpdateTaskField(task._id, { responsiblePerson: e.target.value })}
                              disabled={isTaskUpdating}
                              className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">Unassigned</option>
                              {staff.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.name} ({user.role || 'Staff'})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Due Date */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                              Due Date
                            </label>
                            <input
                              type="date"
                              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleUpdateTaskField(task._id, { dueDate: e.target.value })}
                              disabled={isTaskUpdating}
                              className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                        </div>

                        {/* Lower row: Reminders & Escalations Panel */}
                        {task.status !== 'Done' && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              {/* Remind Staff Button */}
                              <button
                                onClick={() => setReminderModal({
                                  isOpen: true,
                                  task,
                                  type: 'staff',
                                  message: `Hi, please review and finalize the pending onboarding task "${task.title}" for student "${workflow?.admission?.fullName}" at your earliest convenience.`
                                })}
                                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold py-1 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/30 transition-all border border-slate-200/50 dark:border-slate-800"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Remind Staff
                              </button>

                              {/* Remind Student Button */}
                              <button
                                onClick={() => setReminderModal({
                                  isOpen: true,
                                  task,
                                  type: 'student',
                                  message: `Dear ${workflow?.admission?.fullName}, this is a polite reminder regarding your pending onboarding step: "${task.title}". Please contact our office desk to complete this process.`
                                })}
                                className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold py-1 px-2 rounded-lg bg-slate-50 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/30 transition-all border border-slate-200/50 dark:border-slate-800"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Remind Student
                              </button>
                            </div>

                            {/* Escalation Alert / Trigger */}
                            <div>
                              {task.escalationRules?.isEscalated ? (
                                <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 font-bold px-2 py-1 rounded-lg border border-rose-500/20 max-w-full">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                  <span>Escalated to Manager</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEscalationModal({
                                    isOpen: true,
                                    task,
                                    escalatedToUserId: '',
                                    reason: `This task is overdue and requires immediate managerial action.`
                                  })}
                                  className="flex items-center gap-1 text-rose-500 hover:text-white font-semibold py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent transition-all"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  Escalate Task
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Task Completion Log */}
                        {task.status === 'Done' && (
                          <div className="mt-2.5 bg-emerald-500/5 p-2 rounded-lg text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Completed on {new Date(task.completedAt).toLocaleDateString()} by <b>{task.completedBy}</b>
                            </span>
                          </div>
                        )}

                        {/* Recent Email Reminders Tracker */}
                        {task.remindersSent?.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-[10px] text-slate-400 dark:text-slate-500 space-y-1">
                            <span className="font-semibold block uppercase">Reminder Dispatches:</span>
                            {task.remindersSent.slice(-2).map((reminder, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>• Recipient: {reminder.type} ({reminder.message.substring(0, 30)}...)</span>
                                <span>{new Date(reminder.sentAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950/20">
          <p className="text-[11px] text-slate-400">
            * Changes are automatically saved. Completing Fee & Docs advances lifecycle status to <b className="text-emerald-500">Active</b>.
          </p>
        </div>

      </div>

      {/* Dynamic Email Reminder Modal */}
      {reminderModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-200/50 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Send Email Reminder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recipient: <b className="text-slate-700 dark:text-slate-300">{reminderModal.type === 'staff' ? 'Assigned Staff User' : 'Student Email'}</b>
            </p>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase">
                Custom Message Subject
              </label>
              <textarea
                value={reminderModal.message}
                onChange={(e) => setReminderModal({ ...reminderModal, message: e.target.value })}
                rows={4}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Write custom reminder details here..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReminderModal({ isOpen: false, task: null, type: 'staff', message: '' })}
                className="text-xs px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sendingReminder}
                className="text-xs px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {sendingReminder ? 'Sending...' : 'Send Email'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Task Escalation Modal */}
      {escalationModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-200/50 dark:border-slate-700">
            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Escalate Pending Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Task: <b className="text-slate-700 dark:text-slate-300">{escalationModal.task?.title}</b>
            </p>

            <div className="mt-4 space-y-4">
              {/* Choose Supervisor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase">
                  Escalate To Manager/Supervisor
                </label>
                <select
                  value={escalationModal.escalatedToUserId}
                  onChange={(e) => setEscalationModal({ ...escalationModal, escalatedToUserId: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Select Supervisor...</option>
                  {staff.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Escalation Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase">
                  Escalation Reason & Notes
                </label>
                <textarea
                  value={escalationModal.reason}
                  onChange={(e) => setEscalationModal({ ...escalationModal, reason: e.target.value })}
                  rows={3}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="Why is this being escalated? What is blocking progress?"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEscalationModal({ isOpen: false, task: null, escalatedToUserId: '', reason: '' })}
                className="text-xs px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateTask}
                disabled={submittingEscalation}
                className="text-xs px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {submittingEscalation ? 'Escalating...' : 'Submit Escalation'}
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowDetailsDrawer;
