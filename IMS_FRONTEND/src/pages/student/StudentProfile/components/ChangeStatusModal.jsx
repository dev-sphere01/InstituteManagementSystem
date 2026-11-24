import React, { useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const ChangeStatusModal = ({ isOpen, onClose, studentId, currentStatus, onStatusChanged }) => {
  const notify = useNotification();
  const [status, setStatus] = useState(currentStatus || 'Active');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      notify('Please provide a reason for the status change', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/students/${studentId}/status`, {
        lifecycleStatus: status,
        reason,
        date,
      });
      notify(`Status updated to ${status} successfully`, 'success');
      if (onStatusChanged) onStatusChanged(status);
      onClose();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update student status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            🔄 Update Student Lifecycle Status
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 font-bold"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
              <option value="Incomplete">Incomplete</option>
              <option value="OnHold">On Hold</option>
              <option value="Admitted">Admitted</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Effective Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Reason for Status Change <span className="text-rose-500">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Completed all coursework and final exams successfully."
              className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
