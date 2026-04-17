import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../services/NotificationService';
import workflowService from '../../services/workflowService';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'escalated', label: 'Escalated' }
];

const TaskInbox = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuth();

  const [status, setStatus] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [expandedTargets, setExpandedTargets] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAllTasks = async () => {
    setLoadingAll(true);
    try {
      const response = await workflowService.getTasks();
      setAllTasks(response?.data || []);
    } catch (error) {
      notify('Failed to load tasks', 'error');
    } finally {
      setLoadingAll(false);
    }
  };

  const loadAdmissions = async () => {
    try {
      const response = await workflowService.getAdmissions({ limit: 200, page: 1 });
      setAdmissions(response?.admissions || response?.data?.admissions || response?.data || []);
    } catch (error) {
      notify('Failed to load admissions', 'error');
    }
  };

  useEffect(() => {
    loadAllTasks();
    loadAdmissions();
  }, [refreshKey]);

  const completeTask = async (taskId) => {
    try {
      await workflowService.completeTask(taskId);
      notify('Task completed', 'success');
      setRefreshKey((k) => k + 1);
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to complete task', 'error');
    }
  };

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

  const filteredAll = useMemo(() => {
    if (!status) return allTasks;
    return allTasks.filter((t) => t.status === status);
  }, [allTasks, status]);

  const counts = {
    total: filteredAll.length,
    required: filteredAll.filter((t) => ['pending', 'in_progress', 'overdue', 'escalated'].includes(t.status)).length,
    overdue: filteredAll.filter((t) => t.status === 'overdue').length,
    dueSoon: filteredAll.filter((t) => {
      if (!t.dueDate) return false;
      const diffDays = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2 && t.status !== 'completed';
    }).length,
    escalated: filteredAll.filter((t) => t.status === 'escalated').length
  };

  const canComplete = (task) => ['pending', 'in_progress', 'overdue', 'escalated'].includes(task.status);

  const userRoleIds = useMemo(() => {
    const ids = [];
    if (user?.role?._id) ids.push(user.role._id);
    if (Array.isArray(user?.roles)) {
      user.roles.forEach((r) => r?._id && ids.push(r._id));
    }
    return Array.from(new Set(ids.map((r) => r.toString())));
  }, [user]);

  const admissionMap = useMemo(() => {
    const map = new Map();
    admissions.forEach((a) => map.set(a._id, a));
    return map;
  }, [admissions]);

  const groupedByTarget = useMemo(() => {
    const groups = new Map();
    filteredAll.forEach((task) => {
      const key = task.targetId || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    });
    return Array.from(groups.entries()).map(([targetId, groupTasks]) => {
      const admission = admissionMap.get(String(targetId));
      return { targetId, admission, tasks: groupTasks };
    });
  }, [filteredAll, admissionMap]);

  const toggleExpand = (targetId) => {
    setExpandedTargets((prev) => ({
      ...prev,
      [targetId]: !prev[targetId]
    }));
  };

  const canCompleteByRole = (task) => {
    const roleId = task.assignedRole?._id || task.assignedRole;
    if (!roleId) return false;
    return userRoleIds.includes(roleId.toString());
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/70">Workflow Suite</div>
            <h1 className="text-3xl font-semibold">Student Workflow Board</h1>
            <p className="text-sm text-white/80">View all students and update their workflow steps directly.</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <div className="text-white/70">Signed in as</div>
            <div className="font-semibold">{user?.name || 'User'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: counts.total, accent: 'text-slate-900' },
          { label: 'Required Now', value: counts.required, accent: 'text-slate-900' },
          { label: 'Overdue', value: counts.overdue, accent: 'text-red-600' },
          { label: 'Due Soon', value: counts.dueSoon, accent: 'text-amber-600' },
          { label: 'Escalated', value: counts.escalated, accent: 'text-rose-600' }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
            <div className={`text-2xl font-semibold ${item.accent}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm w-56"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="text-xs text-gray-500">Filter tasks by status.</div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Student Workflows</h2>
          <div className="text-xs text-gray-500">Grouped by admission/student</div>
        </div>
        {loadingAll && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-gray-500">Loading tasks...</div>
        )}
        {!loadingAll && groupedByTarget.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-gray-500">No student tasks yet.</div>
        )}
        {!loadingAll && groupedByTarget.map((group) => {
          const admission = group.admission;
          const title = admission?.formNo || admission?.fullName || group.targetId;
          const subtitle = admission?.fullName ? `Form: ${admission.formNo || '-'} · ${admission.contactNumber || ''}` : 'Admission/Student';
          const isExpanded = expandedTargets[group.targetId];
          return (
            <div key={group.targetId} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                className="w-full px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-left"
                onClick={() => toggleExpand(group.targetId)}
              >
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Admission</div>
                  <div className="text-lg font-semibold text-gray-900">{title}</div>
                  <div className="text-xs text-gray-500">{subtitle}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{group.tasks.length} steps</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-slate-200">
                  <div className="divide-y divide-slate-100">
                    {group.tasks.map((task) => (
                      <div key={task._id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && task.description.trim() !== task.title?.trim() && (
                            <div className="text-xs text-gray-500">{task.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</div>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                            {task.status?.replace('_', ' ')}
                          </span>
                          <div className="text-xs text-gray-500">Role: {task.assignedRole?.RoleName || '-'}</div>
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 text-xs hover:underline"
                              onClick={() => navigate(`/dashboard/workflow/tasks/${task._id}`)}
                            >
                              View
                            </button>
                            {canComplete(task) && canCompleteByRole(task) && (
                              <button
                                className="text-green-600 text-xs hover:underline"
                                onClick={() => completeTask(task._id)}
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskInbox;
