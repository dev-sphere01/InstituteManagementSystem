import React, { useState, useEffect } from 'react';
import API from '../../../../services/API';

const StudentHistorySection = ({ studentId }) => {
  const [history, setHistory] = useState({ statusHistory: [], batchHistory: [], feeHistory: [] });
  const [activeTab, setActiveTab] = useState('status');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await API.get(`/students/${studentId}/history`);
      if (res && res.success) {
        setHistory(res.data || {});
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [studentId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>📜</span> Student Audit History &amp; Lifecycle Timeline
          </h3>
          <p className="text-xs text-slate-400">
            Audit logs of status transitions, batch upgrades/downgrades, and fee adjustments.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Status History ({history.statusHistory?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'batch'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Batch History ({history.batchHistory?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fee')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'fee'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fee History ({history.feeHistory?.length || 0})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading history logs...</div>
      ) : (
        <div className="mt-4">
          {/* Status History Tab */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              {(!history.statusHistory || history.statusHistory.length === 0) ? (
                <div className="text-xs text-slate-400 py-6 text-center italic">No status transitions recorded yet.</div>
              ) : (
                history.statusHistory.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {s.fromStatus ? `${s.fromStatus} ➔ ` : ''}
                          <span className="text-indigo-600 dark:text-indigo-400 uppercase">{s.toStatus}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {s.timestamp ? new Date(s.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {s.reason && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-1">
                          <span className="font-semibold text-slate-400">Reason:</span> {s.reason}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Updated by: {s.changedBy?.name || 'Authorized User'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Batch History Tab */}
          {activeTab === 'batch' && (
            <div className="space-y-3">
              {(!history.batchHistory || history.batchHistory.length === 0) ? (
                <div className="text-xs text-slate-400 py-6 text-center italic">No batch upgrades or transfers recorded.</div>
              ) : (
                history.batchHistory.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      b.action === 'Upgraded' ? 'bg-emerald-500' : b.action === 'Downgraded' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          <span className="uppercase text-blue-600 dark:text-blue-400 font-extrabold">{b.action}:</span> {b.batchName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.changedAt ? new Date(b.changedAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {b.reason && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-1">
                          <span className="font-semibold text-slate-400">Reason:</span> {b.reason}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Recorded by: {b.changedBy || 'Admin'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Fee History Tab */}
          {activeTab === 'fee' && (
            <div className="space-y-3">
              {(!history.feeHistory || history.feeHistory.length === 0) ? (
                <div className="text-xs text-slate-400 py-6 text-center italic">No fee modifications recorded.</div>
              ) : (
                history.feeHistory.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Field: <span className="text-emerald-600 font-mono">{f.field}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {f.changedAt ? new Date(f.changedAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-1">
                        Old: <span className="line-through text-rose-500">₹{f.oldValue ?? 0}</span> ➔ New: <span className="font-bold text-emerald-600">₹{f.newValue ?? 0}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Modified by: {f.changedByName || 'Admin'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentHistorySection;
