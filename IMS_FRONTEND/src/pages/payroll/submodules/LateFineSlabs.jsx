import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const emptySlabs = () => [
  { FromCount: 1, ToCount: 3, FinePerOccurrence: 0 },
  { FromCount: 4, ToCount: 5, FinePerOccurrence: 50 },
  { FromCount: 6, ToCount: 999, FinePerOccurrence: 100 },
];

const LateFineSlabs = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { lateFineRule, fetchLateFineRule, saveLateFineRule } = usePayrollStore();
  const { locations, fetchLocations } = useEmployeeStore();
  const [locationId, setLocationId] = useState('');
  const [slabs, setSlabs] = useState(emptySlabs());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchLocations(); }, []);

  useEffect(() => {
    if (locationId) {
      fetchLateFineRule(locationId).then(() => {
        if (lateFineRule?.Slabs?.length > 0) {
          setSlabs(lateFineRule.Slabs);
        } else {
          setSlabs(emptySlabs());
        }
      });
    }
  }, [locationId]);

  const updateSlab = (idx, field, value) =>
    setSlabs((s) => s.map((slab, i) => i === idx ? { ...slab, [field]: Number(value) } : slab));

  const addSlab = () =>
    setSlabs((s) => [...s, { FromCount: '', ToCount: '', FinePerOccurrence: 0 }]);

  const removeSlab = (idx) => setSlabs((s) => s.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!locationId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveLateFineRule(locationId, { LocationId: locationId, Slabs: slabs });
      setSuccess('Fine slabs saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Late Fine Slabs</h2>
      <p className={styles.stepSubtitle}>
        Define cumulative fine slabs based on the number of late occurrences per month.
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className={styles.textMuted}>Select a branch to configure fine slabs.</p>
        </div>
      ) : (
        <div className="max-w-3xl">
          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>From (count)</th>
                  <th className={styles.th}>To (count)</th>
                  <th className={styles.th}>Fine / Occurrence (₹)</th>
                  <th className={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab, idx) => (
                  <tr key={idx} className={styles.trHover}>
                    <td className={styles.td}>
                      <input
                        type="number"
                        className={styles.inputSm()}
                        value={slab.FromCount}
                        min={1}
                        onChange={(e) => updateSlab(idx, 'FromCount', e.target.value)}
                      />
                    </td>
                    <td className={styles.td}>
                      <input
                        type="number"
                        className={styles.inputSm()}
                        value={slab.ToCount}
                        min={1}
                        onChange={(e) => updateSlab(idx, 'ToCount', e.target.value)}
                      />
                    </td>
                    <td className={styles.td}>
                      <input
                        type="number"
                        className={styles.inputSm()}
                        value={slab.FinePerOccurrence}
                        min={0}
                        onChange={(e) => updateSlab(idx, 'FinePerOccurrence', e.target.value)}
                      />
                    </td>
                    <td className={`${styles.td} text-right`}>
                      {slabs.length > 1 && (
                        <button onClick={() => removeSlab(idx)} className="p-1 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={addSlab} className={styles.btnAddRow(isDarkMode)}>
              + Add New Slab
            </button>
            <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
              {saving ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateFineSlabs;
