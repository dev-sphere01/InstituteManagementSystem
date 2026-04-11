import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import API from '../../../services/API';

const Branches = ({ onBack }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    branchName: '', 
    branchCode: '', 
    address: '', 
    city: '', 
    state: '', 
    phone: '', 
    email: '',
    isActive: true 
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await API.branches.getAll();
      setBranches(response.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await API.branches.update(editingId, form);
      } else {
        await API.branches.create(form);
      }
      resetForm();
      fetchBranches();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      branchName: '', 
      branchCode: '', 
      address: '', 
      city: '', 
      state: '', 
      phone: '', 
      email: '',
      isActive: true 
    });
    setEditingId(null);
    setError('');
  };

  const handleEdit = (branch) => {
    setEditingId(branch._id);
    setForm({
      branchName: branch.branchName,
      branchCode: branch.branchCode,
      address: branch.address || '',
      city: branch.city,
      state: branch.state,
      phone: branch.phone || '',
      email: branch.email || '',
      isActive: branch.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await API.branches.delete(id);
      fetchBranches();
    } catch (err) {
      alert('Failed to delete branch');
    }
  };

  return (
    <div className={styles.sectionCard}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
            <h2 className={styles.stepTitle}>Branch Master</h2>
          </div>
          <p className={styles.stepSubtitle}>Manage physical locations and branch information.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className={styles.btnPrimary}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Add Branch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Code</th>
                  <th className={styles.th}>Branch Name</th>
                  <th className={styles.th}>Location</th>
                  <th className={styles.th}>Contact</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th + " text-right"}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-gray-400 italic">No branches configured yet.</td></tr>
                ) : branches.map((branch) => (
                  <tr key={branch._id} className={styles.trHover}>
                    <td className={styles.td}><span className={styles.badge('gray')}>{branch.branchCode}</span></td>
                    <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{branch.branchName}</td>
                    <td className={styles.td}>
                      <div className="text-xs">
                        <p>{branch.city}, {branch.state}</p>
                        <p className="opacity-50 mt-0.5 truncate max-w-[200px]">{branch.address}</p>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className="text-xs">
                        <p>{branch.phone || '—'}</p>
                        <p className="opacity-50 mt-0.5">{branch.email || '—'}</p>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.badge(branch.isActive ? 'green' : 'red')}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={styles.td + " text-right"}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(branch)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(branch._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox + " !max-w-2xl"}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={styles.modalTitle}>{editingId ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            
            {error && <div className={styles.alertError + " mb-6"}>{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={styles.label}>Branch Name <span className="text-red-500">*</span></label>
                  <input className={styles.input()} value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} placeholder="e.g. Main Campus" required />
                </div>
                <div>
                  <label className={styles.label}>Branch Code <span className="text-red-500">*</span></label>
                  <input className={styles.input()} value={form.branchCode} onChange={(e) => setForm({ ...form, branchCode: e.target.value.toUpperCase() })} placeholder="e.g. BR001" required />
                </div>
                <div>
                  <label className={styles.label}>City <span className="text-red-500">*</span></label>
                  <input className={styles.input()} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" required />
                </div>
                <div>
                  <label className={styles.label}>State <span className="text-red-500">*</span></label>
                  <input className={styles.input()} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Maharashtra" required />
                </div>
                <div>
                  <label className={styles.label}>Phone Number</label>
                  <input className={styles.input()} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Contact number" />
                </div>
                <div>
                  <label className={styles.label}>Email Address</label>
                  <input type="email" className={styles.input()} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="branch@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className={styles.label}>Full Address</label>
                  <textarea 
                    className={styles.input() + " min-h-[80px] resize-none"} 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    placeholder="Enter physical address..." 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={form.isActive} 
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Branch is currently active</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnGhost(isDarkMode)}>Discard</button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : editingId ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
