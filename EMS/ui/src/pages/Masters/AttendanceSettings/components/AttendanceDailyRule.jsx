import React, { useState, useEffect, useMemo } from 'react';
import AttendanceDailyRuleService from '@/services/Attendance/AttendanceDailyRule';
import {
    notification,
    TableService,
    ConfirmationService
} from '@/services';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import { hasPermission } from '@/pages/Masters/Positions/components/hasPermissionService';

const AttendanceDailyRule = () => {
    const canRead = hasPermission('masters.attendance_settings.read');
    const canCreate = hasPermission('masters.attendance_settings.create');
    const canUpdate = hasPermission('masters.attendance_settings.update');
    const canDelete = hasPermission('masters.attendance_settings.delete');

    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        LocationID: '',
        EmpType: '',
        MinHours: '',
        MaxHours: '',
        RewardedHours: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const notify = notification();

    const locations = [
        { label: 'Tagore Town Office', id: 1 },
        { label: 'Naini Factory', id: 2 }
    ];

    const empTypes = [
        { label: 'Fixed', id: 1 },
        { label: 'Variable/Wages', id: 2 }
    ];

    useEffect(() => {
        if (canRead) {
            loadRules();
        }
    }, [canRead]);

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await AttendanceDailyRuleService.getAllDailyRules();
            setRules(data || []);
        } catch (error) {
            notify.error('Failed to load daily rules');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            LocationID: '',
            EmpType: '',
            MinHours: '',
            MaxHours: '',
            RewardedHours: ''
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
        if (!formData.LocationID) newErrors.LocationID = 'Location is required';
        if (!formData.MinHours || formData.MinHours < 0) newErrors.MinHours = 'Min hours is required';
        if (!formData.RewardedHours || formData.RewardedHours < 0) newErrors.RewardedHours = 'Rewarded hours is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                LocationID: parseInt(formData.LocationID),
                EmpType: formData.EmpType ? parseInt(formData.EmpType) : null,
                MinHours: parseFloat(formData.MinHours),
                MaxHours: formData.MaxHours === '' ? null : parseFloat(formData.MaxHours),
                RewardedHours: parseFloat(formData.RewardedHours)
            };

            if (editingId) {
                payload.RuleID = editingId;
                await AttendanceDailyRuleService.updateDailyRule(editingId, payload);
                notify.success('Rule updated successfully');
            } else {
                await AttendanceDailyRuleService.createDailyRule(payload);
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
            LocationID: rule.LocationID.toString(),
            EmpType: rule.EmpType ? rule.EmpType.toString() : '',
            MinHours: rule.MinHours.toString(),
            MaxHours: rule.MaxHours !== null ? rule.MaxHours.toString() : '',
            RewardedHours: rule.RewardedHours.toString()
        });
        setEditingId(rule.RuleID);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await ConfirmationService.confirm({
            title: 'Delete Rule',
            message: 'Are you sure you want to delete this daily rule?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            try {
                await AttendanceDailyRuleService.deleteDailyRule(id);
                notify.success('Rule deleted successfully');
                loadRules();
            } catch (error) {
                notify.error('Failed to delete rule');
            }
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'LocationID',
            header: 'Location',
            cell: ({ getValue }) => locations.find(l => l.id === getValue())?.label || getValue()
        },
        {
            accessorKey: 'EmpType',
            header: 'Employee Type',
            cell: ({ getValue }) => empTypes.find(t => t.id === getValue())?.label || 'All'
        },
        {
            accessorKey: 'MinHours',
            header: 'Min Hours'
        },
        {
            accessorKey: 'MaxHours',
            header: 'Max Hours',
            cell: ({ getValue }) => getValue() === null ? 'Or more' : getValue()
        },
        {
            accessorKey: 'RewardedHours',
            header: 'Rewarded Hours',
            cell: ({ getValue }) => (
                <span className="font-semibold text-green-600">{getValue()}h</span>
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
                <h2 className="text-xl font-semibold text-gray-800">Daily Working Hour Rules</h2>
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
                        <li>Define rewards for extended shifts based on location and employee type.</li>
                        <li>Example: Factory employees working 14-16 hours get 18 hours recorded.</li>
                        <li>Use "Max Hours" as empty/null to indicate "or more" (e.g., 16 or more hours).</li>
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
                                {editingId ? 'Edit Daily Rule' : 'Add Daily Rule'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <select
                                    name="LocationID"
                                    value={formData.LocationID}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.LocationID ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                </select>
                                {errors.LocationID && <p className="text-xs text-red-500">{errors.LocationID}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Employee Type (Optional)</label>
                                <select
                                    name="EmpType"
                                    value={formData.EmpType}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                >
                                    <option value="">All Types</option>
                                    {empTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Min Hours</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="MinHours"
                                        value={formData.MinHours}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 14"
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.MinHours ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.MinHours && <p className="text-xs text-red-500">{errors.MinHours}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Max Hours (Optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="MaxHours"
                                        value={formData.MaxHours}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 16"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Rewarded Hours</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="RewardedHours"
                                    value={formData.RewardedHours}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 18"
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${errors.RewardedHours ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.RewardedHours && <p className="text-xs text-red-500">{errors.RewardedHours}</p>}
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

export default AttendanceDailyRule;
