import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FineManager = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { fines, fetchFines, addManualFine, deleteFine } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ Reason: '', Amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    if (empId) fetchFines(empId, month, year);
  }, [empId, month, year]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return `${e.FirstName} ${e.LastName}`.toLowerCase().includes(q) || e.EmpCode?.toLowerCase().includes(q);
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!empId || !form.Amount) return;
    setSaving(true);
    setError('');
    try {
      await addManualFine({
        EmpID: Number(empId),
        Month: month,
        Year: year,
        FineType: 'Manual',
        Reason: form.Reason,
        Amount: Number(form.Amount),
      });
      setForm({ Reason: '', Amount: '' });
      setShowModal(false);
      fetchFines(empId, month, year);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add fine.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fine?')) return;
    await deleteFine(id).catch(() => {});
    fetchFines(empId, month, year);
  };

  const selectedEmp = employees.find((e) => e.EmpID === Number(empId));
  const totalFines = fines.reduce((a, f) => a + (f.Amount || 0), 0);

  return (
    <div>
      <h2 className={styles.stepTitle}>Fine Manager</h2>
      <p className={styles.stepSubtitle}>Manage manual and automatic fines for employees</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Filters & Search */}
        <div className={styles.sectionCard}>
          <div className="flex gap-2 mb-3">
            <select className={styles.selectSm()} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className={styles.selectSm()} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="relative mb-3">
            <input
              className={styles.inputSm()}
              placeholder="Search employee by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={`border rounded-xl overflow-y-auto max-h-72 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-white shadow-sm'}`}>
            {filtered.map((emp) => (
              <div
                key={emp.EmpID}
                onClick={() => { setEmpId(emp.EmpID); setSearch(''); }}
                className={`px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${
                  Number(empId) === emp.EmpID
                    ? isDarkMode ? 'bg-blue-900/40 text-blue-400 font-semibold border-blue-800' : 'bg-blue-50 text-blue-700 font-semibold border-blue-100'
                    : isDarkMode ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-gray-50 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{emp.FirstName} {emp.LastName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{emp.EmpCode}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm italic">No employees found.</div>
            )}
          </div>
        </div>

        {/* Right: Fine Details */}
        <div className={styles.sectionCard}>
          {!selectedEmp ? (
            <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
              <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className={styles.textMuted}>Select an employee from the list to view fines.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEmp.FirstName} {selectedEmp.LastName}</h3>
                  <p className={styles.textMuted}>{MONTHS[month-1]} {year}</p>
                </div>
                <button onClick={() => setShowModal(true)} className={styles.btnWarning}>
                  + Add Manual Fine
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Type</th>
                      <th className={styles.th}>Reason</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 opacity-60 italic text-sm">No fines recorded for this month.</td>
                      </tr>
                    ) : fines.map((f) => (
                      <tr key={f.Id} className={styles.trHover}>
                        <td className={styles.td}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            f.FineType === 'AutoLate'
                              ? isDarkMode ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-800' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : isDarkMode ? 'bg-red-900/30 text-red-500 border border-red-800' : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {f.FineType}
                          </span>
                        </td>
                        <td className={styles.td}>{f.Reason || '—'}</td>
                        <td className={`${styles.td} font-bold text-red-500`}>₹{f.Amount}</td>
                        <td className={`${styles.td} text-right`}>
                          {f.FineType === 'Manual' && (
                            <button onClick={() => handleDelete(f.Id)} className="p-1 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {fines.length > 0 && (
                <div className={`mt-4 p-4 rounded-xl border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'} flex justify-between items-center`}>
                  <span className={styles.textMuted}>Total Deduction</span>
                  <span className="text-lg font-bold text-red-500">₹{totalFines.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Add Manual Fine</h3>
            {error && <div className={styles.alertError}>{error}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className={styles.label}>Reason</label>
                <input
                  className={styles.input()}
                  placeholder="e.g. Damage to equipment"
                  value={form.Reason}
                  onChange={(e) => setForm((f) => ({ ...f, Reason: e.target.value }))}
                />
              </div>
              <div>
                <label className={styles.label}>Amount (₹) *</label>
                <input
                  type="number"
                  className={styles.input()}
                  placeholder="0.00"
                  value={form.Amount}
                  min={1}
                  onChange={(e) => setForm((f) => ({ ...f, Amount: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnGhost(isDarkMode)}>Cancel</button>
                <button type="submit" disabled={saving} className={styles.btnWarning}>
                  {saving ? <span className="loading loading-spinner loading-sm" /> : 'Confirm Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManager;
