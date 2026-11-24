import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react';
import { useThemeStore } from '../../../store';
import useCrmStore from '../../../store/useCrmStore';
import useEmployeeStore from '../../../store/useEmployeeStore';

const CHANNELS = ['Meta', 'Google', 'Offline', 'Email', 'SMS', 'Other'];

const EMPTY = { name: '', channel: 'Meta', branch: ['All'], budget: '', startDate: '', endDate: '', description: '', isActive: true };

// ── Multi-Select Branch Dropdown ─────────────────────────────────────────────
function BranchMultiSelect({ selectedBranches, onChange, locations, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const defaultBranches = ['City Branch', 'Main Branch', 'Indira Nagar', 'Gomti Nagar'];
  const availableOptions = Array.from(new Set([
    ...defaultBranches,
    ...(locations || []).map((l) => l.LocationName || l.branchName).filter(Boolean),
  ]));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = !selectedBranches || selectedBranches.length === 0 || selectedBranches.includes('All');

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(['All']);
    }
  };

  const toggleBranch = (branchName) => {
    let current = (selectedBranches || []).filter((b) => b !== 'All');
    if (current.includes(branchName)) {
      current = current.filter((b) => b !== branchName);
    } else {
      current = [...current, branchName];
    }
    onChange(current.length === 0 ? ['All'] : current);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Branch <span className="text-xs text-gray-400 font-normal">(Multi-Select)</span>
      </label>

      {/* Select Box / Selected Chips */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full px-3 py-1.5 border rounded-md shadow-sm text-sm cursor-pointer flex flex-wrap items-center gap-1.5 transition-all ${
          isDarkMode
            ? 'border-gray-600 bg-gray-700 text-white hover:border-blue-500'
            : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        {isAllSelected ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
            All Branches
          </span>
        ) : (
          selectedBranches.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
            >
              {b}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBranch(b);
                }}
                className="hover:text-red-500 focus:outline-none text-xs ml-0.5"
              >
                &times;
              </button>
            </span>
          ))
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-full rounded-md shadow-xl border max-h-60 overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div
            onClick={toggleAll}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-semibold cursor-pointer border-b ${
              isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-blue-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => {}}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>All Branches</span>
          </div>

          {availableOptions.map((b) => {
            const isChecked = !isAllSelected && selectedBranches.includes(b);
            return (
              <div
                key={b}
                onClick={() => toggleBranch(b)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>{b}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Campaigns() {
  const { isDarkMode } = useThemeStore();
  const { campaigns, campaignsLoading, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } = useCrmStore();
  const { locations, fetchLocations } = useEmployeeStore();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    if (fetchLocations) fetchLocations();
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  };

  const openEdit = (c) => {
    let branchVal = ['All'];
    if (Array.isArray(c.branch)) {
      branchVal = c.branch.length > 0 ? c.branch : ['All'];
    } else if (typeof c.branch === 'string' && c.branch.trim()) {
      branchVal = c.branch.includes(',') ? c.branch.split(',').map((b) => b.trim()) : [c.branch];
    }

    setEditId(c._id);
    setForm({
      name: c.name,
      channel: c.channel,
      branch: branchVal,
      budget: c.budget || '',
      startDate: c.startDate?.split('T')[0] || '',
      endDate: c.endDate?.split('T')[0] || '',
      description: c.description || '',
      isActive: c.isActive,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await updateCampaign(editId, form);
        showToast('Campaign updated.');
      } else {
        await createCampaign(form);
        showToast('Campaign created.');
      }
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      showToast('Campaign deleted.');
    } catch (err) {
      showToast(err.message, false);
    }
  };

  const inputCls = `block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
  }`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const cardCls = `rounded-lg shadow-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  const CHANNEL_COLORS = {
    Meta: 'bg-blue-100 text-blue-700',
    Google: 'bg-red-100 text-red-700',
    Offline: 'bg-gray-100 text-gray-700',
    Email: 'bg-purple-100 text-purple-700',
    SMS: 'bg-green-100 text-green-700',
    Other: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Campaigns</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track marketing spend across channels</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {toast && (
        <div
          className={`rounded-md p-3 border text-sm ${
            toast.ok
              ? isDarkMode ? 'bg-green-900/50 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
              : isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Campaign cards */}
      {campaignsLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : campaigns.length === 0 ? (
        <div className={`${cardCls} p-10 text-center`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No campaigns yet. Create one to start tracking ROI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const branchList = Array.isArray(c.branch)
              ? c.branch
              : typeof c.branch === 'string' && c.branch.trim()
              ? c.branch.split(',').map((b) => b.trim())
              : [];

            return (
              <div key={c._id} className={`${cardCls} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {branchList.length === 0 || branchList.includes('All') ? (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          All Branches
                        </span>
                      ) : (
                        branchList.map((b, i) => (
                          <span
                            key={i}
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              isDarkMode ? 'bg-blue-900/60 text-blue-200 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}
                          >
                            {b}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => openEdit(c)} className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-red-50'}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CHANNEL_COLORS[c.channel] || 'bg-gray-100 text-gray-700'}`}>
                    {c.channel}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      c.isActive
                        ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                        : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{(c.budget || 0).toLocaleString()} <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>budget</span>
                </div>

                {(c.startDate || c.endDate) && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {c.startDate ? new Date(c.startDate).toLocaleDateString() : '?'} → {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editId ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowForm(false)} className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className={`rounded-md p-3 border text-sm ${isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Campaign Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Admissions 2025" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Channel</label>
                  <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} className={inputCls}>
                    {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Budget (₹)</label>
                  <input type="number" min="0" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: +e.target.value }))} placeholder="0" className={inputCls} />
                </div>

                {/* Branch Multi-Select Field */}
                <div>
                  <BranchMultiSelect
                    selectedBranches={form.branch}
                    onChange={(branches) => setForm((f) => ({ ...f, branch: branches }))}
                    locations={locations}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'true' }))} className={inputCls}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional notes" className={inputCls} />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none ${
                    isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

