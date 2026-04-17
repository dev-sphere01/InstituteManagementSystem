import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import useEmployeeStore from '../../../store/useEmployeeStore';

const EmployeeTypes = ({ onBack }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { employeeTypes, fetchEmployeeTypes, createEmployeeType } = useEmployeeStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ EmpTypeName: '', Description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchEmployeeTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.EmpTypeName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createEmployeeType(form);
      setForm({ EmpTypeName: '', Description: '' });
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to create employee type.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h2 className={styles.stepTitle}>Employee Types</h2>
          </div>
          <p className={styles.stepSubtitle}>Define employment categories (e.g., Full-time, Contract).</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.btnPrimary}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Add Type
        </button>
      </div>

      <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th + " w-16"}>#</th>
              <th className={styles.th}>Type Name</th>
              <th className={styles.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {employeeTypes.length === 0 ? (
              <tr><td colSpan={3} className="py-20 text-center text-gray-400 italic">No types configured yet.</td></tr>
            ) : employeeTypes.map((t, i) => (
              <tr key={t.EmpTypeID} className={styles.trHover}>
                <td className={styles.td}><span className={styles.badge('gray')}>{i + 1}</span></td>
                <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.EmpTypeName}</td>
                <td className={styles.td}><span className="text-sm opacity-70">{t.Description || 'No description'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={styles.modalTitle}>Create Employment Type</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {error && <div className={styles.alertError + " mb-6"}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={styles.label}>Type Name <span className="text-red-500 font-bold">*</span></label>
                <input className={styles.input()} value={form.EmpTypeName} onChange={(e) => setForm((f) => ({ ...f, EmpTypeName: e.target.value }))} placeholder="e.g. Permanent, Consultant" required />
              </div>
              <div>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.input() + " min-h-[100px] resize-none"} 
                  value={form.Description} 
                  onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))} 
                  placeholder="Optional details about this employment type..." 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnGhost(isDarkMode)}>Discard</button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Creating...</> : 'Create Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTypes;
