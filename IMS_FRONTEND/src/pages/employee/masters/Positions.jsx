import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import useEmployeeStore from '../../../store/useEmployeeStore';

const Positions = ({ onBack }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { positions, departments, fetchPositions, fetchDepartments, createPosition } = useEmployeeStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ PositionName: '', DeptID: '', Description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchPositions(); fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.PositionName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createPosition(form);
      setForm({ PositionName: '', DeptID: '', Description: '' });
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to create position.');
    } finally {
      setSaving(false);
    }
  };

  const getDeptName = (id) => departments.find((d) => d.DeptID === id)?.DeptName || '—';

  return (
    <div className={styles.sectionCard}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h2 className={styles.stepTitle}>Positions</h2>
          </div>
          <p className={styles.stepSubtitle}>Manage job titles and their departmental assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.btnPrimary}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Add Position
        </button>
      </div>

      <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th + " w-16"}>#</th>
              <th className={styles.th}>Position Title</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">No positions configured yet.</td></tr>
            ) : positions.map((p, i) => (
              <tr key={p.PositionID} className={styles.trHover}>
                <td className={styles.td}><span className={styles.badge('gray')}>{i + 1}</span></td>
                <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.PositionName}</td>
                <td className={styles.td}>
                   <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                    {getDeptName(p.DeptID)}
                   </span>
                </td>
                <td className={styles.td}><span className="text-sm opacity-70">{p.Description || 'No description'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={styles.modalTitle}>Create New Position</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {error && <div className={styles.alertError + " mb-6"}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={styles.label}>Position Title <span className="text-red-500 font-bold">*</span></label>
                <input className={styles.input()} value={form.PositionName} onChange={(e) => setForm((f) => ({ ...f, PositionName: e.target.value }))} placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div>
                <label className={styles.label}>Assign Department</label>
                <select className={styles.select()} value={form.DeptID} onChange={(e) => setForm((f) => ({ ...f, DeptID: Number(e.target.value) }))}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.input() + " min-h-[100px] resize-none"} 
                  value={form.Description} 
                  onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))} 
                  placeholder="Briefly describe the responsibilities..." 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnGhost(isDarkMode)}>Discard</button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Creating...</> : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
