import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../store';
import ticketService from '../../../services/ticketService';
import API from '../../../services/API';
import useEmployeeStore from '../../../store/useEmployeeStore';

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

const PRIORITIES = [
  { label: 'Low', value: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  { label: 'Medium', value: 'Medium', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  { label: 'High', value: 'High', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  { label: 'Urgent', value: 'Urgent', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
];

const CATEGORIES = [
  'Task',
  'Bug',
  'Support',
  'Inquiry',
  'Maintenance',
  'Document Request',
  'Approval',
  'Other',
];

export const CreateTicketModal = ({ isOpen, onClose, onSuccess, initialTicket = null }) => {
  const { isDarkMode } = useThemeStore();
  const { departments: storeDepartments, fetchDepartments, employees, fetchEmployees } = useEmployeeStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Admissions',
    assignedTo: '',
    priority: 'Medium',
    category: 'Task',
    dueDate: '',
    estimatedHours: '',
    tags: '',
  });

  const [subtasks, setSubtasks] = useState(['']);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments?.();
      fetchEmployees?.();
      loadUsers();
      if (initialTicket) {
        setFormData({
          title: initialTicket.title || '',
          description: initialTicket.description || '',
          department: initialTicket.department || 'Admissions',
          assignedTo: initialTicket.assignedTo?._id || initialTicket.assignedTo || '',
          priority: initialTicket.priority || 'Medium',
          category: initialTicket.category || 'Task',
          dueDate: initialTicket.dueDate ? initialTicket.dueDate.substring(0, 10) : '',
          estimatedHours: initialTicket.estimatedHours || '',
          tags: Array.isArray(initialTicket.tags) ? initialTicket.tags.join(', ') : '',
        });
        setSubtasks(
          initialTicket.subtasks && initialTicket.subtasks.length > 0
            ? initialTicket.subtasks.map((st) => st.title)
            : ['']
        );
      } else {
        setFormData({
          title: '',
          description: '',
          department: 'Admissions',
          assignedTo: '',
          priority: 'Medium',
          category: 'Task',
          dueDate: '',
          estimatedHours: '',
          tags: '',
        });
        setSubtasks(['']);
      }
      setError(null);
    }
  }, [isOpen, initialTicket]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users', { params: { limit: 100 } });
      const users = res?.users || res?.data?.users || res?.data || [];
      setUsersList(Array.isArray(users) ? users : []);
    } catch (err) {
      console.warn('Could not fetch users list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubtaskChange = (index, value) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const addSubtaskInput = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtaskInput = (index) => {
    if (subtasks.length === 1) {
      setSubtasks(['']);
    } else {
      setSubtasks(subtasks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.department) {
      setError('Please fill in title, description and select a department.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      subtasks: subtasks.filter((st) => st.trim() !== ''),
      estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0,
      assignedTo: formData.assignedTo || null,
    };

    try {
      if (initialTicket) {
        await ticketService.updateTicket(initialTicket._id, payload);
      } else {
        await ticketService.createTicket(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Combine default and store departments
  const availableDepartments = Array.from(
    new Set([
      ...(storeDepartments?.map((d) => d.DeptName || d.name) || []),
      ...DEFAULT_DEPARTMENTS,
    ])
  ).filter(Boolean);

  // Find department object to map DeptID
  const currentDeptObj = storeDepartments?.find(
    (d) => (d.DeptName || d.name)?.toLowerCase() === formData.department.toLowerCase()
  );

  // Filter employees belonging to the selected department
  const deptEmployees = (employees || []).filter((e) => {
    if (!currentDeptObj) return false;
    return (
      e.DeptID === currentDeptObj.DeptID ||
      e.DepartmentName?.toLowerCase() === formData.department.toLowerCase() ||
      e.department?.toLowerCase() === formData.department.toLowerCase()
    );
  });

  // Map users into department staff vs other staff
  const deptUsers = usersList.filter((u) => {
    if (u.department && u.department.toLowerCase() === formData.department.toLowerCase()) return true;
    const roleName = u.role?.RoleName || u.role?.name || '';
    if (roleName.toLowerCase().includes(formData.department.toLowerCase().split(' ')[0])) return true;
    return false;
  });

  const otherUsers = usersList.filter((u) => !deptUsers.some((du) => du._id === u._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl p-6 transition-all my-8 ${
          isDarkMode ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              🎫
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {initialTicket ? 'Edit Ticket' : 'Create New Ticket / Task'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department-wise routing mapped to individual staff & employees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-sm flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Ticket Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Verify Registration Documents for Batch 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Department & Employee Assignment (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Target Department <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-indigo-500 font-medium">Mapped from Masters</span>
              </div>
              <select
                required
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value, assignedTo: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    🏢 {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Individual Employee Assignment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Assign to Employee
                </label>
                <span className="text-[10px] text-slate-400">
                  {deptUsers.length > 0 ? `${deptUsers.length} in department` : 'Open Queue'}
                </span>
              </div>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">-- Open (Unassigned / Dept Queue) --</option>
                {deptUsers.length > 0 && (
                  <optgroup label={`⭐ ${formData.department} Team Members`}>
                    {deptUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} — {u.role?.RoleName || u.role?.name || 'Department Staff'}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Staff & Employees">
                  {otherUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role?.RoleName || u.role?.name || u.email || 'Staff'})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = formData.priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setFormData({ ...formData, priority: p.value })}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition text-center ${
                        isSelected
                          ? `${p.color} ring-2 ring-indigo-500/30 font-bold shadow-sm`
                          : isDarkMode
                          ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category / Type
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 4"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Description / Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide detailed instructions, context, steps or requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Subtasks checklist builder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Subtasks / Checklist ({subtasks.filter((s) => s.trim()).length})
              </label>
              <button
                type="button"
                onClick={addSubtaskInput}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>+ Add Subtask</span>
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Checklist item ${idx + 1}`}
                    value={st}
                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtaskInput(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Tags <span className="text-xs font-normal text-slate-400">(Comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Admission, Batch2026, Urgent, Document"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 transition flex items-center space-x-2"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>{initialTicket ? 'Update Ticket' : 'Create Ticket'}</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
