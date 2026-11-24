import React, { useEffect, useState } from 'react';
import workflowService from '../../services/workflowService';
import API from '../../services/API';
import { useNotification } from '../../services/NotificationService';
import { 
  Layers, Plus, Trash2, Edit3, CheckCircle2, XCircle, 
  AlertTriangle, Clock, Shield, Save, Sparkles, RefreshCw, 
  ChevronRight, ArrowUpDown, DollarSign, Award, X
} from 'lucide-react';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setForm((prev) => {
      const nextSeq = prev.steps.length;
      return {
        ...prev,
        steps: [...prev.steps, { ...emptyStep, sequence: nextSeq }]
      };
    });
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
          sequence: Number(step.sequence !== undefined && step.sequence !== '' ? step.sequence : idx),
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
        notify('Template updated successfully', 'success');
      } else {
        await workflowService.createTemplate(payload);
        notify('Template created successfully', 'success');
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
      notify(`Template ${!template.isActive ? 'activated' : 'deactivated'}`, 'success');
      loadTemplates();
    } catch (error) {
      notify('Failed to update template status', 'error');
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm";
  const selectClass = "w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm";
  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Workflow Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {editingId ? 'Edit Workflow Template' : 'Workflow Templates'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Design and automate custom multi-stage onboarding, verification, fee collection, and approval pipelines.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold tracking-wide transition-all backdrop-blur-md flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Main Designer Form */}
      <form 
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors" 
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Modify Template Configuration' : 'Create New Template'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the trigger conditions, general information, and ordered execution steps.
              </p>
            </div>
          </div>
          {editingId && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Editing Mode
            </span>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Standard Admission Pipeline"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Trigger Lifecycle Status</label>
            <input
              className={inputClass}
              value={form.triggerStatus}
              onChange={(e) => setForm({ ...form, triggerStatus: e.target.value })}
              placeholder="e.g. Admitted, Applied, Prospect"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Workflow Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the operational goals, departments involved, and checklist prerequisites..."
          />
        </div>

        {/* Auto Sequence Option */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <input
            type="checkbox"
            id="autoSequence"
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
            checked={form.autoSequence}
            onChange={(e) => setForm({ ...form, autoSequence: e.target.checked })}
          />
          <label htmlFor="autoSequence" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Auto-sequence steps by order <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Enforces sequential task progression in order of appearance)</span>
          </label>
        </div>

        {/* Steps Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Workflow Steps
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {form.steps.length} {form.steps.length === 1 ? 'Step' : 'Steps'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure every milestone task, SLA due dates, assigned department role, and escalation matrix.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              onClick={addStep}
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          {form.steps.map((step, index) => (
            <div 
              key={`step-${index}`} 
              className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-5 sm:p-6 space-y-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
            >
              {/* Step Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {step.title || `Step ${index + 1}`}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      key: {step.key || 'not set'}
                    </span>
                  </div>
                </div>

                {form.steps.length > 1 && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              {/* Row 1: Key, Title, Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Step Key Identifier</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. fee_collection, doc_verification"
                    value={step.key}
                    onChange={(e) => updateStep(index, 'key', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Step Display Title</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Fee Collection Stage"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sequence Order</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={step.sequence}
                    onChange={(e) => updateStep(index, 'sequence', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Due in Days, Assigned Role, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>SLA Due In (Days)</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="3"
                    value={step.dueInDays}
                    onChange={(e) => updateStep(index, 'dueInDays', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Assigned Department Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className={selectClass}
                    value={step.assignedRole}
                    onChange={(e) => updateStep(index, 'assignedRole', e.target.value)}
                    required
                  >
                    <option value="">Select Responsible Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.RoleName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Execution Priority</label>
                  <select
                    className={selectClass}
                    value={step.priority}
                    onChange={(e) => updateStep(index, 'priority', e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Step Type & Financial Rules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Task Type Category</label>
                  <select
                    className={selectClass}
                    value={step.stepType}
                    onChange={(e) => updateStep(index, 'stepType', e.target.value)}
                  >
                    <option value="general">General Administrative Task</option>
                    <option value="fee_collection">Fee Collection / Finance</option>
                    <option value="final_certificate">Final Certificate / Clearance</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Min Required Payment (₹)</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={step.paymentRules?.minRequiredAmount || 0}
                    onChange={(e) => updatePaymentRule(index, 'minRequiredAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Min Installments Paid</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={step.paymentRules?.minRequiredInstallments || 0}
                    onChange={(e) => updatePaymentRule(index, 'minRequiredInstallments', e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Rule Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  id={`fullPayment-${index}`}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
                  checked={!!step.paymentRules?.requiresFullPayment}
                  onChange={(e) => updatePaymentRule(index, 'requiresFullPayment', e.target.checked)}
                />
                <label htmlFor={`fullPayment-${index}`} className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Final clearance requires 100% full fee payment completion before advancing
                </label>
              </div>

              {/* Step Description */}
              <div>
                <label className={labelClass}>Step Guidance / Description</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows="2"
                  placeholder="Detailed instructions shown to the assignee for completing this task..."
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                />
              </div>

              {/* Escalation Matrix */}
              <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Escalation Matrix & SLA Overdue Actions
                    </span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                    onClick={() => addEscalationLevel(index)}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Level
                  </button>
                </div>

                {(step.escalationLevels || []).length === 0 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 py-1">
                    No escalation levels configured. Overdue tasks will remain with the primary assigned role.
                  </div>
                )}

                {(step.escalationLevels || []).map((lvl, levelIndex) => (
                  <div 
                    key={`level-${index}-${levelIndex}`} 
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="sm:col-span-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Level {levelIndex + 1}
                    </div>
                    <div className="sm:col-span-5">
                      <select
                        className={selectClass}
                        value={lvl.role}
                        onChange={(e) => updateEscalationLevel(index, levelIndex, 'role', e.target.value)}
                      >
                        <option value="">Escalate to Role...</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>{role.RoleName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        className={inputClass}
                        type="number"
                        placeholder="Overdue days trigger"
                        value={lvl.dueInDays || 0}
                        onChange={(e) => updateEscalationLevel(index, levelIndex, 'dueInDays', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        onClick={() => removeEscalationLevel(index, levelIndex)}
                        title="Remove level"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
            disabled={creating}
          >
            {creating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {editingId ? 'Updating...' : 'Saving Template...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingId ? 'Save Updated Template' : 'Publish Workflow Template'}
              </>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
              onClick={cancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Existing Templates Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Template Library</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage saved workflow definitions, toggle activation states, or update pipeline blueprints.
            </p>
          </div>
          <button
            onClick={loadTemplates}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Refresh Templates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No templates designed yet</h4>
            <p className="text-xs max-w-sm">Use the form above to build your first admission onboarding workflow template.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Template Blueprint</th>
                  <th className="py-3.5 px-4">Trigger Stage</th>
                  <th className="py-3.5 px-4 text-center">Configured Steps</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {templates.map((template) => (
                  <tr 
                    key={template._id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{template.name}</div>
                      {template.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {template.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                        {template.triggerStatus || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {template.steps?.length || 0} Steps
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        template.isActive 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${template.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {template.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(template)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            template.isActive 
                              ? 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50' 
                              : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {template.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => startEdit(template)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
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
    </div>
  );
};

export default WorkflowTemplates;

