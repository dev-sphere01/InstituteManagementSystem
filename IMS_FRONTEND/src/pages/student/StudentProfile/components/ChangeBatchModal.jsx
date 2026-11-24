import React, { useState, useEffect } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const ChangeBatchModal = ({ isOpen, onClose, studentId, currentBatch, onBatchChanged }) => {
  const notify = useNotification();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBatchName, setSelectedBatchName] = useState(currentBatch || '');
  const [action, setAction] = useState('Upgraded');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await API.get('/batches');
        setBatches(res?.data || []);
      } catch (err) {
        console.error('Failed to load batches:', err);
      }
    };
    if (isOpen) {
      fetchBatches();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBatchSelect = (e) => {
    const bId = e.target.value;
    setSelectedBatchId(bId);
    const bObj = batches.find((b) => b._id === bId);
    if (bObj) {
      setSelectedBatchName(`${bObj.course} - ${bObj.batchTiming} (${bObj.subject})`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchName.trim()) {
      notify('Please select or specify a target batch', 'error');
      return;
    }
    if (!reason.trim()) {
      notify('Please provide a reason for the batch transfer', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/students/${studentId}/batch`, {
        batchId: selectedBatchId,
        batchName: selectedBatchName,
        action,
        reason,
        date,
      });
      notify(`Batch ${action.toLowerCase()} successfully`, 'success');
      if (onBatchChanged) onBatchChanged(selectedBatchName);
      onClose();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update student batch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            🎓 Batch Upgrade / Downgrade / Transfer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Action Type</label>
            <div className="flex gap-2">
              {['Upgraded', 'Downgraded', 'Transferred'].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setAction(act)}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                    action === act
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Target Batch</label>
            {batches.length > 0 ? (
              <select
                value={selectedBatchId}
                onChange={handleBatchSelect}
                className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 font-semibold"
              >
                <option value="">Select an active batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.course} — {b.batchTiming} ({b.teacherName})
                  </option>
                ))}
              </select>
            ) : null}
            <input
              type="text"
              placeholder="Or enter batch name manually..."
              value={selectedBatchName}
              onChange={(e) => setSelectedBatchName(e.target.value)}
              className="w-full px-3 py-2 mt-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
            />
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
            <label className="block text-slate-500 font-bold mb-1">Reason for Batch Change <span className="text-rose-500">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Upgraded to Advanced Batch after passing foundational evaluation."
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
              {submitting ? 'Saving...' : 'Apply Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeBatchModal;
