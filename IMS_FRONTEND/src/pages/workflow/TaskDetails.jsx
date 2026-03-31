import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../services/NotificationService';
import workflowService from '../../services/workflowService';
import API from '../../services/API';

const statusOptions = [
  'pending',
  'in_progress',
  'blocked',
  'done',
  'overdue',
  'canceled'
];

const statusBadge = (value) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    blocked: 'bg-gray-200 text-gray-700',
    done: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-700',
    canceled: 'bg-slate-200 text-slate-600'
  };
  return map[value] || 'bg-slate-100 text-slate-700';
};

const TaskDetails = () => {
  const { id } = useParams();
  const notify = useNotification();
  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadTask = async () => {
    setLoading(true);
    try {
      const taskResponse = await workflowService.getTaskById(id);
      const historyResponse = await workflowService.getTaskHistory(id);
      setTask(taskResponse?.data || null);
      setHistory(historyResponse?.data || []);
      setStatus(taskResponse?.data?.status || '');
    } catch (error) {
      notify('Failed to load task details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.users.getAll({ limit: 200 });
      setUsers(response?.data || []);
    } catch (error) {
      notify('Failed to load users', 'error');
    }
  };

  useEffect(() => {
    loadTask();
    loadUsers();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!status) return;
    try {
      await workflowService.updateTaskStatus(id, status, note);
      notify('Task status updated', 'success');
      setNote('');
      loadTask();
    } catch (error) {
      notify('Failed to update status', 'error');
    }
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    setAssigning(true);
    try {
      await workflowService.assignTask(id, { assignedTo: assignTo });
      notify('Task assigned', 'success');
      setAssignTo('');
      loadTask();
    } catch (error) {
      notify('Failed to assign task', 'error');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading task...</div>;
  }

  if (!task) {
    return <div className="text-gray-500">Task not found.</div>;
  }

  const isCanceled = task.status === 'canceled';

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

      {isCanceled && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          This task is canceled and cannot be updated or reassigned.
        </div>
      )}

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

      {!isCanceled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Update Status</h2>
              <p className="text-sm text-gray-500">Use this only when the work is ready to move forward.</p>
            </div>
            <div className="flex flex-col gap-3">
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                ))}
              </select>
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Add a note for audit trail"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                onClick={handleStatusUpdate}
              >
                Save
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assign To User</h2>
              <p className="text-sm text-gray-500">Directly assign this task to a specific person.</p>
            </div>
            <div className="flex flex-col gap-3">
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role?.RoleName || 'Role'})
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                onClick={handleAssign}
                disabled={!assignTo || assigning}
              >
                {assigning ? 'Assigning...' : 'Assign User'}
              </button>
            </div>
          </div>
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
