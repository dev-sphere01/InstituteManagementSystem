import React, { useEffect, useState } from 'react';
import workflowService from '../../services/workflowService';
import API from '../../services/API';
import { useNotification } from '../../services/NotificationService';

const emptyStep = {
  key: '',
  title: '',
  description: '',
  sequence: 0,
  dueInDays: 0,
  assignedRole: '',
  priority: 'normal',
  stepType: 'general',
  paymentRules: {
    minRequiredAmount: 0,
    minRequiredInstallments: 0,
    requiresFullPayment: false
  },
  escalationLevels: []
};

const WorkflowTemplates = () => {
  const notify = useNotification();
  const [templates, setTemplates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerStatus: 'Admitted',
    autoSequence: true,
    steps: [{ ...emptyStep }]
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await workflowService.getTemplates();
      setTemplates(response?.data || []);
    } catch (error) {
      notify('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await API.roles.getAll({ limit: 200 });
      setRoles(response?.data || []);
    } catch (error) {
      notify('Failed to load roles', 'error');
    }
  };

  useEffect(() => {
    loadTemplates();
    loadRoles();
  }, []);

  const hydrateFormFromTemplate = (template) => {
    const steps = (template.steps || []).map((step, idx) => {
      const escalationLevels = (step.escalationLevels && step.escalationLevels.length > 0)
        ? step.escalationLevels.map((lvl, levelIndex) => ({
            level: Number(lvl.level || levelIndex + 1),
            role: lvl.role?._id || lvl.role || '',
            dueInDays: Number(lvl.dueInDays || 0)
          }))
        : (step.escalation && step.escalation.enabled && step.escalation.escalateToRole)
          ? [{
              level: 1,
              role: step.escalation.escalateToRole?._id || step.escalation.escalateToRole,
              dueInDays: Number(step.escalation.afterDays || 0)
            }]
          : [];

      return {
        key: step.key || `step_${idx + 1}`,
        title: step.title || `Step ${idx + 1}`,
        description: step.description || '',
        sequence: Number(step.sequence || idx),
        dueInDays: Number(step.dueInDays || 0),
        assignedRole: step.assignedRole?._id || step.assignedRole || '',
        priority: step.priority || 'normal',
        stepType: step.stepType || 'general',
        paymentRules: {
          minRequiredAmount: Number(step.paymentRules?.minRequiredAmount || 0),
          minRequiredInstallments: Number(step.paymentRules?.minRequiredInstallments || 0),
          requiresFullPayment: !!step.paymentRules?.requiresFullPayment
        },
        escalationLevels
      };
    });

    setForm({
      name: template.name || '',
      description: template.description || '',
      triggerStatus: template.triggerStatus || '',
      autoSequence: template.autoSequence !== undefined ? template.autoSequence : true,
      steps: steps.length > 0 ? steps : [{ ...emptyStep }]
    });
  };

  const startEdit = (template) => {
    setEditingId(template._id);
    hydrateFormFromTemplate(template);
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm({
      name: '',
      description: '',
      triggerStatus: 'Admitted',
      autoSequence: true,
      steps: [{ ...emptyStep }]
    });
  };

  const updateStep = (index, key, value) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], [key]: value };
      return { ...prev, steps };
    });
  };

  const updatePaymentRule = (index, key, value) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const paymentRules = { ...(steps[index].paymentRules || {}) };
      paymentRules[key] = value;
      steps[index] = { ...steps[index], paymentRules };
      return { ...prev, steps };
    });
  };

  const addEscalationLevel = (index) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const escalationLevels = [...(steps[index].escalationLevels || [])];
      escalationLevels.push({ level: escalationLevels.length + 1, role: '', dueInDays: 0 });
      steps[index] = { ...steps[index], escalationLevels };
      return { ...prev, steps };
    });
  };

  const updateEscalationLevel = (index, levelIndex, key, value) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const escalationLevels = [...(steps[index].escalationLevels || [])];
      escalationLevels[levelIndex] = { ...escalationLevels[levelIndex], [key]: value };
      steps[index] = { ...steps[index], escalationLevels };
      return { ...prev, steps };
    });
  };

  const removeEscalationLevel = (index, levelIndex) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const escalationLevels = [...(steps[index].escalationLevels || [])]
        .filter((_, i) => i !== levelIndex)
        .map((lvl, idx) => ({ ...lvl, level: idx + 1 }));
      steps[index] = { ...steps[index], escalationLevels };
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, { ...emptyStep }] }));
  };

  const removeStep = (index) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        triggerStatus: form.triggerStatus,
        autoSequence: form.autoSequence,
        steps: form.steps.map((step, idx) => ({
          key: step.key || `step_${idx + 1}`,
          title: step.title || `Step ${idx + 1}`,
          description: step.description,
          sequence: Number(step.sequence || idx),
          dueInDays: Number(step.dueInDays || 0),
          assignedRole: step.assignedRole,
          priority: step.priority || 'normal',
          stepType: step.stepType || 'general',
          paymentRules: {
            minRequiredAmount: Number(step.paymentRules?.minRequiredAmount || 0),
            minRequiredInstallments: Number(step.paymentRules?.minRequiredInstallments || 0),
            requiresFullPayment: !!step.paymentRules?.requiresFullPayment
          },
          escalationLevels: (step.escalationLevels || []).map((lvl, levelIndex) => ({
            level: Number(lvl.level || levelIndex + 1),
            role: lvl.role,
            dueInDays: Number(lvl.dueInDays || 0)
          })),
          escalation: (step.escalationLevels && step.escalationLevels.length > 0)
            ? {
                enabled: true,
                afterDays: Number(step.escalationLevels[0]?.dueInDays || 0),
                escalateToRole: step.escalationLevels[0]?.role || undefined
              }
            : { enabled: false, afterDays: 0 }
        }))
      };

      if (editingId) {
        await workflowService.updateTemplate(editingId, payload);
        notify('Template updated', 'success');
      } else {
        await workflowService.createTemplate(payload);
        notify('Template created', 'success');
      }
      cancelEdit();
      loadTemplates();
    } catch (error) {
      notify(editingId ? 'Failed to update template' : 'Failed to create template', 'error');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (template) => {
    try {
      await workflowService.setTemplateActive(template._id, !template.isActive);
      notify('Template updated', 'success');
      loadTemplates();
    } catch (error) {
      notify('Failed to update template', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">Workflow Studio</div>
          <h1 className="text-3xl font-semibold">Templates</h1>
          <p className="text-sm text-white/70">Design the exact steps every admission must follow.</p>
        </div>
      </div>

      <form className="space-y-5 border rounded-3xl p-6 bg-white shadow-sm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Template Name</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Office Workflow"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Trigger Status</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={form.triggerStatus}
              onChange={(e) => setForm({ ...form, triggerStatus: e.target.value })}
              placeholder="Admitted"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="This workflow creates fee, document, and registration tasks."
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoSequence}
            onChange={(e) => setForm({ ...form, autoSequence: e.target.checked })}
          />
          Auto-sequence steps by order
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Steps</h2>
            <button type="button" className="text-blue-600 hover:underline" onClick={addStep}>
              Add Step
            </button>
          </div>
          {form.steps.map((step, index) => (
            <div key={`step-${index}`} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500">Step {index + 1}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Step Key</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    placeholder="fee_collection"
                    value={step.key}
                    onChange={(e) => updateStep(index, 'key', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Step Title</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    placeholder="Fee Collection"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Sequence Order</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    type="number"
                    placeholder="1"
                    value={step.sequence}
                    onChange={(e) => updateStep(index, 'sequence', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Due In Days</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    type="number"
                    placeholder="3"
                    value={step.dueInDays}
                    onChange={(e) => updateStep(index, 'dueInDays', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Assigned Role</label>
                  <select
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    value={step.assignedRole}
                    onChange={(e) => updateStep(index, 'assignedRole', e.target.value)}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.RoleName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Priority</label>
                  <select
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    value={step.priority}
                    onChange={(e) => updateStep(index, 'priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Step Type</label>
                  <select
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    value={step.stepType}
                    onChange={(e) => updateStep(index, 'stepType', e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="fee_collection">Fee Collection</option>
                    <option value="final_certificate">Final Certificate</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Min Required Amount</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    type="number"
                    placeholder="0"
                    value={step.paymentRules?.minRequiredAmount || 0}
                    onChange={(e) => updatePaymentRule(index, 'minRequiredAmount', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Min Required Installments</label>
                  <input
                    className="border rounded-lg px-2 py-2 text-sm w-full"
                    type="number"
                    placeholder="0"
                    value={step.paymentRules?.minRequiredInstallments || 0}
                    onChange={(e) => updatePaymentRule(index, 'minRequiredInstallments', e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!step.paymentRules?.requiresFullPayment}
                  onChange={(e) => updatePaymentRule(index, 'requiresFullPayment', e.target.checked)}
                />
                Final step requires full payment
              </label>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Step Description</label>
                <textarea
                  className="border rounded-lg px-2 py-2 text-sm w-full"
                  rows="2"
                  placeholder="Describe the task"
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Escalation Levels</div>
                  <button
                    type="button"
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => addEscalationLevel(index)}
                  >
                    Add Level
                  </button>
                </div>
                {(step.escalationLevels || []).length === 0 && (
                  <div className="text-xs text-gray-500">No escalation levels configured.</div>
                )}
                {(step.escalationLevels || []).map((lvl, levelIndex) => (
                  <div key={`level-${index}-${levelIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="text-xs text-gray-500">Level {levelIndex + 1}</div>
                    <select
                      className="border rounded-lg px-2 py-2 text-sm w-full"
                      value={lvl.role}
                      onChange={(e) => updateEscalationLevel(index, levelIndex, 'role', e.target.value)}
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>{role.RoleName}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded-lg px-2 py-2 text-sm w-full"
                        type="number"
                        placeholder="Due days"
                        value={lvl.dueInDays || 0}
                        onChange={(e) => updateEscalationLevel(index, levelIndex, 'dueInDays', e.target.value)}
                      />
                      <button
                        type="button"
                        className="text-red-600 text-xs hover:underline"
                        onClick={() => removeEscalationLevel(index, levelIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {form.steps.length > 1 && (
                <button
                  type="button"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => removeStep(index)}
                >
                  Remove Step
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
            disabled={creating}
          >
            {creating ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Template' : 'Create Template')}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700"
              onClick={cancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="border rounded-3xl p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Existing Templates</h2>
        {loading ? (
          <div className="text-sm text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-gray-500">No templates yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Trigger</th>
                  <th className="text-left px-3 py-2">Steps</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template, idx) => (
                  <tr key={template._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-3 py-2 font-medium">{template.name}</td>
                    <td className="px-3 py-2">{template.triggerStatus || '-'}</td>
                    <td className="px-3 py-2">{template.steps?.length || 0}</td>
                    <td className="px-3 py-2">{template.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-3 py-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => toggleActive(template)}
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="ml-3 text-indigo-600 hover:underline"
                        onClick={() => startEdit(template)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTemplates;
