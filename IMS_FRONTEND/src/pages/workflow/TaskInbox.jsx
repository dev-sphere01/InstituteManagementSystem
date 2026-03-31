import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../services/NotificationService';
import workflowService from '../../services/workflowService';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'canceled', label: 'Canceled' }
];

const TaskInbox = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuth();

  const [scope, setScope] = useState('my');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [startPayload, setStartPayload] = useState({
    templateId: '',
    targetType: 'admission',
    targetId: ''
  });
  const [starting, setStarting] = useState(false);
  const [expandedTargets, setExpandedTargets] = useState({});

  const filters = useMemo(() => {
    const payload = {};
    if (status) payload.status = status;
    if (scope === 'my' && user?._id) payload.assignedTo = user._id;
    if (scope === 'role' && user?.role?._id) payload.assignedRole = user.role._id;
    return payload;
  }, [scope, status, user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await workflowService.getTasks(filters);
      setTasks(response?.data || []);
    } catch (error) {
      notify('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await workflowService.getTemplates({ isActive: true });
      setTemplates(response?.data || []);
    } catch (error) {
      notify('Failed to load templates', 'error');
    }
  };

  const loadAdmissions = async () => {
    try {
      const response = await workflowService.getAdmissions({ limit: 100, page: 1 });
      setAdmissions(response?.admissions || response?.data?.admissions || response?.data || []);
    } catch (error) {
      notify('Failed to load admissions', 'error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, refreshKey]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (startPayload.targetType === 'admission') {
      loadAdmissions();
    }
  }, [startPayload.targetType]);

  const updateStatus = async (taskId, nextStatus) => {
    try {
      await workflowService.updateTaskStatus(taskId, nextStatus);
      notify('Task updated', 'success');
      setRefreshKey((k) => k + 1);
    } catch (error) {
      notify('Failed to update task', 'error');
    }
  };

  const startWorkflow = async () => {
    if (!startPayload.templateId || !startPayload.targetId) {
      notify('Template and target are required', 'warning');
      return;
    }
    setStarting(true);
    try {
      await workflowService.createWorkflow({
        templateId: startPayload.templateId,
        targetType: startPayload.targetType,
        targetId: startPayload.targetId
      });
      notify('Workflow started', 'success');
      setStartPayload({
        templateId: '',
        targetType: 'admission',
        targetId: ''
      });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      notify('Failed to start workflow', 'error');
    } finally {
      setStarting(false);
    }
  };

  const assignToMe = async (taskId) => {
    if (!user?._id) return;
    try {
      await workflowService.assignTask(taskId, { assignedTo: user._id });
      notify('Task assigned to you', 'success');
      setRefreshKey((k) => k + 1);
    } catch (error) {
      notify('Failed to assign task', 'error');
    }
  };

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

  const requiredTasks = tasks.filter((t) => ['pending', 'in_progress', 'overdue', 'blocked'].includes(t.status));
  const counts = {
    total: tasks.length,
    required: requiredTasks.length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    dueSoon: tasks.filter((t) => {
      if (!t.dueDate) return false;
      const diffDays = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2 && t.status !== 'done';
    }).length,
    blocked: tasks.filter((t) => t.status === 'blocked').length
  };

  const canMarkDone = (task) => !['done', 'blocked', 'canceled'].includes(task.status);
  const canAssignToMe = (task) => !task.assignedTo && !['done', 'canceled', 'blocked'].includes(task.status) && scope === 'role';

  const admissionMap = useMemo(() => {
    const map = new Map();
    admissions.forEach((a) => map.set(a._id, a));
    return map;
  }, [admissions]);

  const groupedByTarget = useMemo(() => {
    const groups = new Map();
    tasks.forEach((task) => {
      const key = task.targetId || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    });
    return Array.from(groups.entries()).map(([targetId, groupTasks]) => {
      const admission = admissionMap.get(String(targetId));
      return { targetId, admission, tasks: groupTasks };
    });
  }, [tasks, admissionMap]);

  const toggleExpand = (targetId) => {
    setExpandedTargets((prev) => ({
      ...prev,
      [targetId]: !prev[targetId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/70">Workflow Suite</div>
            <h1 className="text-3xl font-semibold">Command Center</h1>
            <p className="text-sm text-white/80">Focus on the tasks that move admissions forward.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-full border ${scope === 'my' ? 'bg-white text-blue-700 border-white' : 'bg-transparent text-white border-white/40'}`}
              onClick={() => setScope('my')}
            >
              My Tasks
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${scope === 'role' ? 'bg-white text-blue-700 border-white' : 'bg-transparent text-white border-white/40'}`}
              onClick={() => setScope('role')}
            >
              Role Tasks
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: counts.total, accent: 'text-slate-900' },
          { label: 'Required Now', value: counts.required, accent: 'text-slate-900' },
          { label: 'Overdue', value: counts.overdue, accent: 'text-red-600' },
          { label: 'Due Soon', value: counts.dueSoon, accent: 'text-amber-600' },
          { label: 'Blocked', value: counts.blocked, accent: 'text-gray-700' }
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
        <div className="text-xs text-gray-500">Required tasks include pending, in progress, overdue, and blocked.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Required Actions</h2>
            <span className="text-xs text-gray-500">Top priority items</span>
          </div>
          {requiredTasks.length === 0 ? (
            <div className="text-sm text-gray-500 mt-3">No required actions right now.</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredTasks.slice(0, 6).map((task) => (
                <div key={task._id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{task.title}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </div>
                  <div className="text-xs text-gray-500">Role: {task.assignedRole?.RoleName || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Start Workflow</h2>
            <p className="text-sm text-gray-500">Generate tasks from a template.</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Template</label>
              <select
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={startPayload.templateId}
                onChange={(e) => setStartPayload({ ...startPayload, templateId: e.target.value })}
              >
                <option value="">Select Template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Target Type</label>
              <select
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={startPayload.targetType}
                onChange={(e) => setStartPayload({ ...startPayload, targetType: e.target.value })}
              >
                <option value="admission">Admission</option>
                <option value="student">Student</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Target</label>
              {startPayload.targetType === 'admission' ? (
                <select
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={startPayload.targetId}
                  onChange={(e) => setStartPayload({ ...startPayload, targetId: e.target.value })}
                >
                  <option value="">Select Admission</option>
                  {admissions.map((admission) => (
                    <option key={admission._id} value={admission._id}>
                      {admission.formNo || admission.fullName || admission._id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="Student/Custom ObjectId"
                  value={startPayload.targetId}
                  onChange={(e) => setStartPayload({ ...startPayload, targetId: e.target.value })}
                />
              )}
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white w-full"
              onClick={startWorkflow}
              disabled={starting}
            >
              {starting ? 'Starting...' : 'Start Workflow'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Student Workflows</h2>
          <div className="text-xs text-gray-500">Grouped by admission/student</div>
        </div>
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-gray-500">Loading tasks...</div>
        )}
        {!loading && groupedByTarget.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-gray-500">No tasks found</div>
        )}
        {!loading && groupedByTarget.map((group) => {
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
                          <div className="text-xs text-gray-500">Owner: {task.assignedTo?.name || task.assignedRole?.RoleName || '-'}</div>
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 text-xs hover:underline"
                              onClick={() => navigate(`/dashboard/workflow/tasks/${task._id}`)}
                            >
                              View
                            </button>
                            {canAssignToMe(task) && (
                              <button
                                className="text-indigo-600 text-xs hover:underline"
                                onClick={() => assignToMe(task._id)}
                              >
                                Assign to Me
                              </button>
                            )}
                            {canMarkDone(task) && (
                              <button
                                className="text-green-600 text-xs hover:underline"
                                onClick={() => updateStatus(task._id, 'done')}
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
