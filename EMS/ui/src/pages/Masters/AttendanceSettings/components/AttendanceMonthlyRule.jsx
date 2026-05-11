import React, { useState, useEffect, useMemo } from 'react';
import AttendanceMonthlyRuleService from '@/services/Attendance/AttendanceMonthlyRule';
import {
    notification,
    TableService,
    ConfirmationService
} from '@/services';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import { hasPermission } from '@/pages/Masters/Positions/components/hasPermissionService';

const AttendanceMonthlyRule = () => {
    const canRead = hasPermission('masters.attendance_settings.read');
    const canCreate = hasPermission('masters.attendance_settings.create');
    const canUpdate = hasPermission('masters.attendance_settings.update');
    const canDelete = hasPermission('masters.attendance_settings.delete');

    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        ThresholdMin: '',
        ThresholdMax: '',
        TargetHours: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const notify = notification();

    useEffect(() => {
        if (canRead) {
            loadRules();
        }
    }, [canRead]);

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await AttendanceMonthlyRuleService.getAllMonthlyRules();
            setRules(data || []);
        } catch (error) {
            notify.error('Failed to load monthly rules');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            ThresholdMin: '',
            ThresholdMax: '',
            TargetHours: ''
        });
        setErrors({});
        setEditingId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ThresholdMin || formData.ThresholdMin < 0) newErrors.ThresholdMin = 'Min threshold is required';
        if (!formData.ThresholdMax || formData.ThresholdMax < 0) newErrors.ThresholdMax = 'Max threshold is required';
        if (!formData.TargetHours || formData.TargetHours < 0) newErrors.TargetHours = 'Target hours is required';
        
        if (parseFloat(formData.ThresholdMin) > parseFloat(formData.ThresholdMax)) {
            newErrors.ThresholdMax = 'Max threshold must be greater than min threshold';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                ThresholdMin: parseFloat(formData.ThresholdMin),
                ThresholdMax: parseFloat(formData.ThresholdMax),
                TargetHours: parseFloat(formData.TargetHours)
            };

            if (editingId) {
                payload.RuleID = editingId;
                await AttendanceMonthlyRuleService.updateMonthlyRule(editingId, payload);
                notify.success('Rule updated successfully');
            } else {
                await AttendanceMonthlyRuleService.createMonthlyRule(payload);
                notify.success('Rule created successfully');
            }
            setShowModal(false);
            resetForm();
            loadRules();
        } catch (error) {
            notify.error('Failed to save rule');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (rule) => {
        setFormData({
            ThresholdMin: rule.ThresholdMin.toString(),
            ThresholdMax: rule.ThresholdMax.toString(),
            TargetHours: rule.TargetHours.toString()
        });
        setEditingId(rule.RuleID);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await ConfirmationService.confirm({
            title: 'Delete Rule',
            message: 'Are you sure you want to delete this monthly rule?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            try {
                await AttendanceMonthlyRuleService.deleteMonthlyRule(id);
                notify.success('Rule deleted successfully');
                loadRules();
            } catch (error) {
                notify.error('Failed to delete rule');
            }
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'ThresholdMin',
            header: 'Min Threshold',
            cell: ({ getValue }) => <span className="font-medium text-gray-900">{getValue()}h</span>
        },
        {
            accessorKey: 'ThresholdMax',
            header: 'Max Threshold',
            cell: ({ getValue }) => <span className="font-medium text-gray-900">{getValue()}h</span>
        },
        {
            accessorKey: 'TargetHours',
            header: 'Target/Standard Hours',
            cell: ({ getValue }) => (
                <span className="font-semibold text-blue-600">{getValue()}h</span>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {canUpdate && (
                        <button onClick={() => handleEdit(row.original)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={() => handleDelete(row.original.RuleID)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ], [canUpdate, canDelete]);

    if (!canRead) return <div className="p-4 text-red-600">Access Denied</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Monthly Rounding Rules</h2>
                {canCreate && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <Plus size={18} /> Add Rule
                    </button>
                )}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5" size={18} />
                <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>Define ranges for monthly total hours that should be rounded up to a standard value.</li>
                        <li>Example: Total hours between 190 and 200 are updated to exactly 200 hours.</li>
                        <li>This helps in payroll rounding and standardization.</li>
                    </ul>
                </div>
            </div>

            <TableService
                columns={columns}
                data={rules}
                loading={loading}
                serverPagination={false}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Edit Monthly Rule' : 'Add Monthly Rule'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Min Threshold (h)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="ThresholdMin"
                                        value={formData.ThresholdMin}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 190"
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.ThresholdMin ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.ThresholdMin && <p className="text-xs text-red-500">{errors.ThresholdMin}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Max Threshold (h)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="ThresholdMax"
                                        value={formData.ThresholdMax}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 200"
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.ThresholdMax ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.ThresholdMax && <p className="text-xs text-red-500">{errors.ThresholdMax}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Target Standard Hours (h)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="TargetHours"
                                    value={formData.TargetHours}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 200"
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.TargetHours ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.TargetHours && <p className="text-xs text-red-500">{errors.TargetHours}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingId ? 'Update Rule' : 'Save Rule')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceMonthlyRule;
