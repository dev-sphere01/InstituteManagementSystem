import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../../../store';
import useCrmStore from '../../../../store/useCrmStore';

const STAGES   = ['New', 'Contacted', 'Warm', 'Hot', 'Converted', 'Lost'];
const SOURCES  = ['Website', 'Facebook', 'Google', 'Walk-in', 'Cold Call', 'Referral', 'CSV Import', 'Other'];

const EMPTY = {
  name: '', email: '', phone: '', altPhone: '', source: 'Website',
  stage: 'New', branch: '', course: '', city: '', notes: '', assignmentMode: 'round-robin'
};

export default function LeadFormModal({ lead, onClose, onSaved }) {
  const { isDarkMode } = useThemeStore();
  const { createLead, updateLead, campaigns, fetchCampaigns } = useCrmStore();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
    if (lead) {
      setForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        altPhone: lead.altPhone || '',
        source: lead.source || 'Website',
        stage: lead.stage || 'New',
        branch: lead.branch || '',
        course: lead.course || '',
        city: lead.city || '',
        notes: lead.notes || '',
        campaign: lead.campaign?._id || lead.campaign || '',
        assignmentMode: 'round-robin',
      });
    }
  }, [lead]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (lead) {
        await updateLead(lead._id, form);
      } else {
        await createLead(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
  }`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className={`rounded-md p-3 border text-sm ${isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Alternate Phone</label>
              <input value={form.altPhone} onChange={e => set('altPhone', e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={e => set('source', e.target.value)} className={inputCls}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Stage</label>
              <select value={form.stage} onChange={e => set('stage', e.target.value)} className={inputCls}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Course of Interest</label>
              <input value={form.course} onChange={e => set('course', e.target.value)} placeholder="e.g. B.Tech, MBA" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <input value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="Branch name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Campaign</label>
              <select value={form.campaign || ''} onChange={e => set('campaign', e.target.value)} className={inputCls}>
                <option value="">None</option>
                {campaigns.map(c => <option key={c._id} value={c._id}>{c.name} ({c.channel})</option>)}
              </select>
            </div>
          </div>

          {!lead && (
            <div>
              <label className={labelCls}>Assignment Mode</label>
              <select value={form.assignmentMode} onChange={e => set('assignmentMode', e.target.value)} className={inputCls}>
                <option value="round-robin">Round Robin</option>
                <option value="least-loaded">Least Loaded</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..." className={inputCls} />
          </div>

          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onClose}
              className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none ${
                isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}>
              {saving ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>Saving...</>
              ) : lead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
