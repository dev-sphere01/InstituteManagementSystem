import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../store';
import ticketService from '../../../services/ticketService';
import API from '../../../services/API';
import useEmployeeStore from '../../../store/useEmployeeStore';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Under Review', 'Pending', 'Resolved', 'Closed'];

const PRIORITY_BADGES = {
  Low: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  Medium: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
  High: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  Urgent: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800 animate-pulse',
};

const STATUS_BADGES = {
  Open: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
  'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
  'Under Review': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
  Closed: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const DEFAULT_DEPARTMENTS = [
  'Admissions',
  'Accounts & Finance',
  'Academic & Faculty',
  'IT & Technical Support',
  'Human Resources',
  'Operations & Admin',
  'Student Services',
  'Examination',
  'Marketing & Outreach',
];

export const TicketDetailModal = ({
  ticketId,
  isOpen,
  onClose,
  onUpdate,
  onEdit,
}) => {
  const { isDarkMode } = useThemeStore();
  const { departments: storeDepartments, fetchDepartments } = useEmployeeStore();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'comments', 'activity'

  // Subtask input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reassignment & Status modal controls
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [savingAssign, setSavingAssign] = useState(false);

  // Resolution Notes prompt
  const [resolutionPromptOpen, setResolutionPromptOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (isOpen && ticketId) {
      loadTicket();
      loadUsers();
      fetchDepartments?.();
      setActiveTab('details');
      setIsReassigning(false);
      setResolutionPromptOpen(false);
    }
  }, [isOpen, ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTicketById(ticketId);
      const data = res?.ticket || res?.data?.ticket || res?.data || res;
      setTicket(data);
      setSelectedDept(data.department || 'Admissions');
      setSelectedAssignee(data.assignedTo?._id || data.assignedTo || '');
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get('/users', { params: { limit: 100 } });
      const users = res?.users || res?.data?.users || res?.data || [];
      setUsersList(Array.isArray(users) ? users : []);
    } catch (err) {
      console.warn('Could not fetch users list:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      setTargetStatus(newStatus);
      setResolutionNotes(ticket?.resolutionNotes || '');
      setResolutionPromptOpen(true);
      return;
    }

    try {
      const res = await ticketService.updateTicketStatus(ticket._id, newStatus);
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated || { ...ticket, status: newStatus });
      onUpdate?.();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
    }
  };

  const confirmStatusWithNotes = async () => {
    try {
      const res = await ticketService.updateTicketStatus(
        ticket._id,
        targetStatus,
        resolutionNotes
      );
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated || { ...ticket, status: targetStatus, resolutionNotes });
      setResolutionPromptOpen(false);
      onUpdate?.();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
    }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await ticketService.toggleSubtask(ticket._id, subtaskId, !currentStatus);
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setAddingSubtask(true);
    try {
      const res = await ticketService.addSubtask(ticket._id, newSubtaskTitle.trim());
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated);
      setNewSubtaskTitle('');
      onUpdate?.();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add subtask');
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await ticketService.deleteSubtask(ticket._id, subtaskId);
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await ticketService.addComment(ticket._id, commentText.trim(), isInternalComment);
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated);
      setCommentText('');
      setIsInternalComment(false);
      onUpdate?.();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveAssignment = async () => {
    setSavingAssign(true);
    try {
      const res = await ticketService.assignTicket(
        ticket._id,
        selectedAssignee || 'unassigned',
        selectedDept
      );
      const updated = res?.ticket || res?.data?.ticket;
      setTicket(updated);
      setIsReassigning(false);
      onUpdate?.();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSavingAssign(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticket.ticketNumber}?`)) {
      try {
        await ticketService.deleteTicket(ticket._id);
        onUpdate?.();
        onClose();
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to delete ticket');
      }
    }
  };

  if (!isOpen) return null;

  const availableDepartments = Array.from(
    new Set([
      ...DEFAULT_DEPARTMENTS,
      ...(storeDepartments?.map((d) => d.DeptName || d.name) || []),
    ])
  ).filter(Boolean);

  const completedSubtasksCount =
    ticket?.subtasks?.filter((st) => st.isCompleted).length || 0;
  const totalSubtasksCount = ticket?.subtasks?.length || 0;
  const subtaskProgress =
    totalSubtasksCount > 0
      ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-2xl h-full shadow-2xl flex flex-col transition-all overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-l border-slate-800 text-slate-100' : 'bg-white text-slate-800'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {ticket?.ticketNumber || 'TKT-????'}
            </span>
            {ticket && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.Medium
                }`}
              >
                {ticket.priority} Priority
              </span>
            )}
            {ticket?.category && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {ticket.category}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {ticket && (
              <button
                onClick={() => onEdit?.(ticket)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Edit Ticket"
              >
                ✏️
              </button>
            )}
            <button
              onClick={handleDeleteTicket}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Delete Ticket"
            >
              🗑️
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Loading ticket details...</p>
          </div>
        ) : ticket ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Quick Status bar */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {ticket.title}
                </h2>
                {/* Status Dropdown */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status:
                  </span>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer shadow-sm ${
                      STATUS_BADGES[ticket.status] || STATUS_BADGES.Open
                    }`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ticket.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Department & Employee Assignment Card */}
            <div
              className={`p-4 rounded-2xl border transition ${
                isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <span>🏢</span>
                  <span>Assignment & Department</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsReassigning(!isReassigning)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isReassigning ? 'Cancel' : 'Reassign / Transfer'}
                </button>
              </div>

              {!isReassigning ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Department</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>{ticket.department}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Assigned Individual Employee</span>
                    {ticket.assignedTo ? (
                      <div className="flex items-center space-x-2 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                          {ticket.assignedTo.name?.[0] || 'E'}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {ticket.assignedTo.name || ticket.assignedToName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 italic mt-0.5 block">
                        Unassigned (In Department Queue)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Reassignment Form */
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      >
                        {availableDepartments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Employee
                      </label>
                      <select
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      >
                        <option value="">-- Open (Unassigned / Dept Queue) --</option>
                        {(() => {
                          const deptStaff = usersList.filter((u) => {
                            if (u.department && u.department.toLowerCase() === selectedDept.toLowerCase()) return true;
                            const roleName = u.role?.RoleName || u.role?.name || '';
                            if (roleName.toLowerCase().includes(selectedDept.toLowerCase().split(' ')[0])) return true;
                            return false;
                          });
                          const otherStaff = usersList.filter((u) => !deptStaff.some((du) => du._id === u._id));

                          return (
                            <>
                              {deptStaff.length > 0 && (
                                <optgroup label={`⭐ ${selectedDept} Team Members`}>
                                  {deptStaff.map((u) => (
                                    <option key={u._id} value={u._id}>
                                      {u.name} — {u.role?.RoleName || u.role?.name || 'Department Staff'}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="All Other Staff">
                                {otherStaff.map((u) => (
                                  <option key={u._id} value={u._id}>
                                    {u.name} ({u.role?.RoleName || u.role?.name || u.email || 'Staff'})
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsReassigning(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAssignment}
                      disabled={savingAssign}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition disabled:opacity-50"
                    >
                      {savingAssign ? 'Saving...' : 'Save Reassignment'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metadata Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Created By</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block truncate">
                  {ticket.createdBy?.name || ticket.createdByName || 'System'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Due Date</span>
                <span className={`font-semibold mt-0.5 block ${
                  ticket.dueDate && new Date(ticket.dueDate) < new Date() && !['Resolved', 'Closed'].includes(ticket.status)
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Not Set'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Est. Hours</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {ticket.estimatedHours ? `${ticket.estimatedHours} hrs` : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Created On</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <span>📝</span>
                <span>Details & Subtasks ({totalSubtasksCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                  activeTab === 'comments'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <span>💬</span>
                <span>Discussion ({ticket.comments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                  activeTab === 'activity'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <span>📜</span>
                <span>Activity Log ({ticket.activityLog?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: DETAILS & SUBTASKS */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Description & Instructions
                  </h4>
                  <div
                    className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isDarkMode ? 'bg-slate-800/40 text-slate-200' : 'bg-slate-50 text-slate-800'
                    }`}
                  >
                    {ticket.description}
                  </div>
                </div>

                {/* Resolution Notes if resolved */}
                {ticket.resolutionNotes && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-sm">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      ✅ Resolution Details
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-200 text-xs">
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                )}

                {/* Subtask Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Checklist ({completedSubtasksCount}/{totalSubtasksCount})
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {subtaskProgress}% Done
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {totalSubtasksCount > 0 && (
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${subtaskProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* List of subtasks */}
                  <div className="space-y-2 mb-3">
                    {ticket.subtasks && ticket.subtasks.length > 0 ? (
                      ticket.subtasks.map((st) => (
                        <div
                          key={st._id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition ${
                            st.isCompleted
                              ? isDarkMode
                                ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-400 line-through'
                                : 'bg-emerald-50/50 border-emerald-200 text-slate-400 line-through'
                              : isDarkMode
                              ? 'bg-slate-800/40 border-slate-800 text-slate-200 hover:border-slate-700'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(st.isCompleted)}
                              onChange={() => handleToggleSubtask(st._id, st.isCompleted)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                            />
                            <span className="text-sm font-medium">{st.title}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(st._id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No subtasks defined yet.</p>
                    )}
                  </div>

                  {/* Quick Add Subtask Input */}
                  <form onSubmit={handleAddSubtask} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="+ Add a quick subtask checklist item..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={addingSubtask || !newSubtaskTitle.trim()}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition"
                    >
                      {addingSubtask ? 'Adding...' : 'Add'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: COMMENTS / DISCUSSION */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* List Comments */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((c, i) => (
                      <div
                        key={c._id || i}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          c.isInternal
                            ? isDarkMode
                              ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                            : isDarkMode
                            ? 'bg-slate-800/40 border-slate-800 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{c.userName || 'Staff Member'}</span>
                            {c.userRole && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {c.userRole}
                              </span>
                            )}
                            {c.isInternal && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase tracking-wider">
                                🔒 Internal Note
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      No discussion notes yet. Leave a comment or internal update below.
                    </p>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
                  <textarea
                    required
                    rows={2}
                    placeholder="Write a message, reply or update for this ticket..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>🔒 Internal Staff Note (Visible to employees only)</span>
                    </label>

                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition shadow"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: AUDIT ACTIVITY LOG */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {ticket.activityLog && ticket.activityLog.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-2">
                    {ticket.activityLog.map((log, i) => (
                      <div key={log._id || i} className="relative pl-5 text-xs">
                        <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-400">by</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {log.performedByName || 'Staff'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                            {log.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Resolution Notes Modal Prompt */}
        {resolutionPromptOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 ${
                isDarkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-800'
              }`}
            >
              <h3 className="text-base font-bold flex items-center space-x-2">
                <span>🎯</span>
                <span>Mark Ticket as {targetStatus}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please provide any resolution notes, summary of actions taken, or outcome:
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Verified student registration documents, corrected admission date and notified applicant."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolutionPromptOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmStatusWithNotes}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                >
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
