import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const HolidayManagement = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { holidays, selectedLocationId, setLocationId, fetchHolidays, createHoliday, deleteHoliday } = usePayrollStore();
  const { locations, fetchLocations } = useEmployeeStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ Name: '', Date: '', IsWorkingDay: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchLocations(); }, []);
  useEffect(() => {
    if (selectedLocationId) fetchHolidays(selectedLocationId);
  }, [selectedLocationId]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Name.trim() || !form.Date || !selectedLocationId) return;
    setSaving(true);
    setError('');
    try {
      await createHoliday({ ...form, LocationId: selectedLocationId });
      setForm({ Name: '', Date: '', IsWorkingDay: false });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create holiday.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    await deleteHoliday(id).catch(() => {});
    fetchHolidays(selectedLocationId);
  };

  return (
    <div className={styles.sectionCard}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className={styles.stepTitle}>Holiday Management</h2>
          <p className={styles.stepSubtitle}>Define holidays and special working days for payroll calculation.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <select
              className={styles.selectSm()}
              value={selectedLocationId || ''}
              onChange={(e) => setLocationId(Number(e.target.value))}
            >
              <option value="">Select Branch</option>
              {locations.map((l) => (
                <option key={l.LocationID} value={l.LocationID}>
                  {l.LocationName}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedLocationId}
            className={styles.btnPrimary}
          >
            + Add Holiday
          </button>
        </div>
      </div>

      {!selectedLocationId ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl opacity-50 border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={styles.textMuted}>Select a branch to manage holidays.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Holiday Name</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 italic">No holidays added for this branch yet.</td>
                </tr>
              ) : holidays.map((h) => (
                <tr key={h.Id} className={styles.trHover}>
                  <td className={styles.td}>{h.Date?.split('T')[0]}</td>
                  <td className={`${styles.td} font-medium`}>{h.Name}</td>
                  <td className={styles.td}>
                    <span className={styles.badge(h.IsWorkingDay ? 'yellow' : 'blue')}>
                      {h.IsWorkingDay ? 'Working' : 'Non-Working'}
                    </span>
                  </td>
                  <td className={`${styles.td} text-right`}>
                    <button onClick={() => handleDelete(h.Id)} className="p-1.5 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Add New Holiday</h3>
            {error && <div className={styles.alertError}>{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={styles.label}>Holiday Name *</label>
                <input
                  className={styles.input()}
                  placeholder="e.g. Independence Day"
                  value={form.Name}
                  onChange={(e) => set('Name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Date *</label>
                <input
                  type="date"
                  className={styles.input()}
                  value={form.Date}
                  onChange={(e) => set('Date', e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isWorkingDay"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={form.IsWorkingDay}
                  onChange={(e) => set('IsWorkingDay', e.target.checked)}
                />
                <label htmlFor="isWorkingDay" className="text-sm font-medium cursor-pointer">
                  Is a working day (counts for pay)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnGhost(isDarkMode)}>Cancel</button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
