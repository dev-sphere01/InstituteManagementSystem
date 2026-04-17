import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../services/NotificationService';
import workflowService from '../../services/workflowService';
import { useAuth } from '../../context/AuthContext';

const statusBadge = (value) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-700',
    escalated: 'bg-rose-100 text-rose-700'
  };
  return map[value] || 'bg-slate-100 text-slate-700';
};

const TaskDetails = () => {
  const { id } = useParams();
  const notify = useNotification();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [feeSummary, setFeeSummary] = useState(null);
  const [payAmounts, setPayAmounts] = useState({});

  const loadTask = async () => {
    setLoading(true);
    try {
      const taskResponse = await workflowService.getTaskById(id);
      const historyResponse = await workflowService.getTaskHistory(id);
      setTask(taskResponse?.data || null);
      setHistory(historyResponse?.data || []);
    } catch (error) {
      notify('Failed to load task details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFeeSummary = async (targetType, targetId) => {
    try {
      const response = await workflowService.getFeeSummary({ targetType, targetId });
      setFeeSummary(response?.data || null);
    } catch (error) {
      setFeeSummary(null);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  useEffect(() => {
    if (task?.targetType && task?.targetId) {
      loadFeeSummary(task.targetType, task.targetId);
    }
  }, [task?.targetType, task?.targetId]);

  const userRoleIds = useMemo(() => {
    const ids = [];
    if (user?.role?._id) ids.push(user.role._id);
    if (Array.isArray(user?.roles)) {
      user.roles.forEach((r) => r?._id && ids.push(r._id));
    }
    return Array.from(new Set(ids.map((r) => r.toString())));
  }, [user]);

  const canClaim = task && !task.assignedTo && userRoleIds.includes(task.assignedRole?._id?.toString());
  const canComplete = task && task.assignedTo && task.assignedTo?._id?.toString() === user?._id?.toString();

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await workflowService.claimTask(id);
      notify('Task claimed', 'success');
      loadTask();
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to claim task', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await workflowService.completeTask(id, note);
      notify('Task completed', 'success');
      setNote('');
      loadTask();
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to complete task', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handlePay = async (installmentId) => {
    const amount = Number(payAmounts[installmentId] || 0);
    if (!amount || amount <= 0) {
      notify('Enter a payment amount', 'warning');
      return;
    }
    try {
      await workflowService.payInstallment(installmentId, amount);
      notify('Payment recorded', 'success');
      setPayAmounts((prev) => ({ ...prev, [installmentId]: '' }));
      if (task?.targetType && task?.targetId) {
        loadFeeSummary(task.targetType, task.targetId);
      }
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to record payment', 'error');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading task...</div>;
  }

  if (!task) {
    return <div className="text-gray-500">Task not found.</div>;
  }

  const finance = feeSummary?.finance;
  const installments = feeSummary?.installments || [];
  const remaining = finance ? Math.max(0, (finance.totalFee || 0) - (finance.totalPaid || 0)) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Task Detail</div>
            <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(task.status)}`}>
            {task.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Due Date</div>
          <div className="text-lg font-semibold text-gray-800">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Assigned Role</div>
          <div className="text-lg font-semibold text-gray-800">{task.assignedRole?.RoleName || '-'}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Assigned User</div>
          <div className="text-lg font-semibold text-gray-800">{task.assignedTo?.name || 'Unassigned'}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Dependencies</div>
          <div className="text-lg font-semibold text-gray-800">
            {task.dependsOn?.length ? task.dependsOn.join(', ') : 'None'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Action Center</h2>
            <p className="text-sm text-gray-500">Claim and complete the task when work is ready.</p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Add a note for audit trail"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-3">
              {canClaim && (
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming ? 'Claiming...' : 'Claim Task'}
                </button>
              )}
              {canComplete && (
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? 'Completing...' : 'Complete Step'}
                </button>
              )}
            </div>
            {!canClaim && !canComplete && (
              <div className="text-xs text-gray-500">You can claim this task if it is unassigned and matches your role.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Workflow Context</h2>
            <p className="text-sm text-gray-500">Step key: {task.stepKey}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-gray-500">Step Type</div>
              <div className="font-semibold text-gray-800">{task.stepType || 'general'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-gray-500">Escalation Level</div>
              <div className="font-semibold text-gray-800">{task.escalationLevel || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {task.stepType === 'fee_collection' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fee Summary</h2>
              <p className="text-sm text-gray-500">Track installments and payments for this application.</p>
            </div>
            {finance && (
              <div className="text-right text-sm">
                <div className="text-gray-500">Remaining</div>
                <div className="font-semibold text-red-600">?{remaining}</div>
              </div>
            )}
          </div>
          {!finance && (
            <div className="text-sm text-gray-500">No fee plan configured for this application.</div>
          )}
          {finance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-gray-500">Total Fee</div>
                <div className="text-lg font-semibold text-gray-800">?{finance.totalFee || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-gray-500">Total Paid</div>
                <div className="text-lg font-semibold text-emerald-600">?{finance.totalPaid || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-gray-500">Installments</div>
                <div className="text-lg font-semibold text-gray-800">{installments.length}</div>
              </div>
            </div>
          )}
          {finance && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Paid</th>
                    <th className="text-left px-3 py-2">Due Date</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst) => (
                    <tr key={inst._id} className="border-b">
                      <td className="px-3 py-2">{inst.installmentNo}</td>
                      <td className="px-3 py-2">?{inst.amount}</td>
                      <td className="px-3 py-2">?{inst.paidAmount || 0}</td>
                      <td className="px-3 py-2">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-2">{inst.status}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="border rounded-lg px-2 py-1 text-xs w-24"
                            placeholder="Amount"
                            value={payAmounts[inst._id] || ''}
                            onChange={(e) => setPayAmounts((prev) => ({ ...prev, [inst._id]: e.target.value }))}
                          />
                          <button
                            className="text-indigo-600 text-xs hover:underline"
                            onClick={() => handlePay(inst._id)}
                          >
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">History</h2>
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">No history yet.</div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="border border-slate-200 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-800 capitalize">
                  {item.fromStatus || '-'} to {item.toStatus}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()} by {item.changedBy?.name || 'System'}
                </div>
                {item.note && <div className="text-sm text-gray-600 mt-2">{item.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
