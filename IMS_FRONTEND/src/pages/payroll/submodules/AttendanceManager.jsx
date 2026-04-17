import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (t) => t ? t.substring(0, 5) : '—';

const AttendanceManager = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  
  const { locations, fetchLocations } = useEmployeeStore();
  const { attendance, fetchAttendance, updateAttendance } = usePayrollStore();
  const [locationId, setLocationId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLocations(); }, []);
  useEffect(() => { if (locationId) fetchAttendance(locationId, month, year); }, [locationId, month, year]);

  const filtered = attendance.filter((a) => {
    const q = search.toLowerCase();
    return (
      String(a.EmpID).includes(q) ||
      a.EmpName?.toLowerCase().includes(q) ||
      a.AtdEmpCode?.toLowerCase().includes(q)
    );
  });

  const handleUpdate = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      await updateAttendance(editRow.AttendaceID, {
        ...editRow,
        CheckInTime: editRow.CheckInTime || null,
        CheckOutTime: editRow.CheckOutTime || null,
      });
      setEditRow(null);
      fetchAttendance(locationId, month, year);
    } catch {
      /* retry */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Attendance Manager</h2>
      <p className={styles.stepSubtitle}>View and edit daily attendance records for your employees.</p>

      <div className="flex flex-wrap gap-4 mb-8 items-end p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="w-full sm:w-auto min-w-[200px]">
          <label className={styles.label}>Branch</label>
          <select className={styles.select()} value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
            <option value="">Select Branch</option>
            {locations.map((l) => <option key={l.LocationID} value={l.LocationID}>{l.LocationName}</option>)}
          </select>
        </div>
        <div className="w-auto">
          <label className={styles.label}>Month</label>
          <select className={styles.select()} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div className="w-auto">
          <label className={styles.label}>Year</label>
          <select className={`${styles.select()} w-28`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={styles.label}>Quick Search</label>
          <input
            className={styles.input()}
            placeholder="Search employee name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!locationId ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl border-gray-100 dark:border-gray-800 opacity-60">
          <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className={styles.textMuted}>Select a branch to explore employee attendance logs.</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
            <div className="overflow-x-auto">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Check In</th>
                    <th className={styles.th}>Check Out</th>
                    <th className={styles.th}>Hours</th>
                    <th className={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-400 italic">No attendance records found for this period.</td>
                    </tr>
                  ) : filtered.map((a) => (
                    <tr key={a.AttendaceID} className={styles.trHover}>
                      <td className={styles.td}>{a.Date?.split('T')[0]}</td>
                      <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{a.EmpName || a.EmpID}</td>
                      <td className={styles.td}><span className={styles.badge('gray')}>{a.AtdEmpCode}</span></td>
                      <td className={styles.td}><span className="font-mono text-xs">{fmt(a.CheckInTime)}</span></td>
                      <td className={styles.td}><span className="font-mono text-xs">{fmt(a.CheckOutTime)}</span></td>
                      <td className={styles.td}>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          {a.TotalHours ?? '—'}h
                        </span>
                      </td>
                      <td className={styles.td}>
                        <button
                          onClick={() => setEditRow({ ...a })}
                          className={styles.btnOutlineSm(isDarkMode)}
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editRow && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={styles.modalTitle}>Modify Attendance</h3>
              <button onClick={() => setEditRow(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-4 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                {(editRow.EmpName || '?')[0]}
              </div>
              <div>
                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editRow.EmpName || 'N/A'}</p>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">{editRow.Date?.split('T')[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Check-In Time</label>
                <input
                  type="time"
                  className={styles.input()}
                  value={editRow.CheckInTime || ''}
                  onChange={(e) => setEditRow((r) => ({ ...r, CheckInTime: e.target.value }))}
                />
              </div>
              <div>
                <label className={styles.label}>Check-Out Time</label>
                <input
                  type="time"
                  className={styles.input()}
                  value={editRow.CheckOutTime || ''}
                  onChange={(e) => setEditRow((r) => ({ ...r, CheckOutTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <button onClick={() => setEditRow(null)} className={styles.btnGhost(isDarkMode)}>Discard</button>
              <button onClick={handleUpdate} disabled={saving} className={styles.btnPrimary}>
                {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
