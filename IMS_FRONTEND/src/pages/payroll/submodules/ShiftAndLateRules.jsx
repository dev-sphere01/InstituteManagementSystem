import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const ShiftAndLateRules = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { shiftRule, fetchShiftRule, saveShiftRule } = usePayrollStore();
  const { locations, fetchLocations } = useEmployeeStore();
  const [locationId, setLocationId] = useState('');
  const [form, setForm] = useState({
    ShiftName: '',
    ShiftStart: '09:00',
    GracePeriodMins: 10,
    LateThresholdMins: 30,
    HalfDayThresholdMins: 180,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchLocations(); }, []);

  useEffect(() => {
    if (locationId) {
      fetchShiftRule(locationId).then(() => {
        if (shiftRule) {
          setForm({
            ShiftName: shiftRule.ShiftName || '',
            ShiftStart: shiftRule.ShiftStart || '09:00',
            GracePeriodMins: shiftRule.GracePeriodMins ?? 10,
            LateThresholdMins: shiftRule.LateThresholdMins ?? 30,
            HalfDayThresholdMins: shiftRule.HalfDayThresholdMins ?? 180,
          });
        }
      });
    }
  }, [locationId]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!locationId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveShiftRule(locationId, { ...form, LocationId: locationId });
      setSuccess('Shift rules saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Shift & Late Rules</h2>
      <p className={styles.stepSubtitle}>
        Configure working hours and penalty thresholds for attendance.
      </p>

      <div className="mb-6 flex items-center gap-4">
        <label className={styles.label}>Branch:</label>
        <div className="w-64">
          <select
            className={styles.selectSm()}
            value={locationId}
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
      </div>

      {!locationId ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl opacity-50 border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={styles.textMuted}>Select a branch to configure shift rules.</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={styles.label}>Shift Name</label>
                <input
                  className={styles.input()}
                  value={form.ShiftName}
                  onChange={(e) => set('ShiftName', e.target.value)}
                  placeholder="Morning Shift"
                />
              </div>
              <div>
                <label className={styles.label}>Shift Start Time</label>
                <input
                  type="time"
                  className={styles.input()}
                  value={form.ShiftStart}
                  onChange={(e) => set('ShiftStart', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={styles.label}>
                  Grace Period (minutes)
                </label>
                <input
                  type="number"
                  className={styles.input()}
                  value={form.GracePeriodMins}
                  min={0}
                  onChange={(e) => set('GracePeriodMins', Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">Check-in within this window = On Time</p>
              </div>
              <div>
                <label className={styles.label}>
                  Late Threshold (minutes)
                </label>
                <input
                  type="number"
                  className={styles.input()}
                  value={form.LateThresholdMins}
                  min={0}
                  onChange={(e) => set('LateThresholdMins', Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">Beyond grace, up to this = Late</p>
              </div>
              <div>
                <label className={styles.label}>
                  Half-Day Threshold (minutes)
                </label>
                <input
                  type="number"
                  className={styles.input()}
                  value={form.HalfDayThresholdMins}
                  min={0}
                  onChange={(e) => set('HalfDayThresholdMins', Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">Beyond late threshold, up to this = Half Day</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
              Save Rules Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShiftAndLateRules;
