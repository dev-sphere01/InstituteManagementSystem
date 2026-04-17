import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AllowanceManager = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { allowances, fetchAllowances, saveAllowance } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ Travel: 0, Food: 0, Mobile: 0, Other: 0, Bonus: 0, OtherIncome: 0 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    if (empId) {
      fetchAllowances(empId, month, year).then((data) => {
        if (data) {
          setForm({
            Travel: data.Travel ?? 0,
            Food: data.Food ?? 0,
            Mobile: data.Mobile ?? 0,
            Other: data.Other ?? 0,
            Bonus: data.Bonus ?? 0,
            OtherIncome: data.OtherIncome ?? 0,
          });
        } else {
          setForm({ Travel: 0, Food: 0, Mobile: 0, Other: 0, Bonus: 0, OtherIncome: 0 });
        }
      });
    }
  }, [empId, month, year]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: Number(value) }));

  const total = Object.values(form).reduce((a, b) => a + (Number(b) || 0), 0);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return `${e.FirstName} ${e.LastName}`.toLowerCase().includes(q) || e.EmpCode?.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!empId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveAllowance({ EmpID: Number(empId), Month: month, Year: year, ...form });
      setSuccess('Allowances saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEmp = employees.find((e) => e.EmpID === Number(empId));

  return (
    <div>
      <h2 className={styles.stepTitle}>Allowance Manager</h2>
      <p className={styles.stepSubtitle}>Configure employee allowances and extra income</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Employee Selection */}
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

        {/* Right: Allowance Form */}
        <div className={styles.sectionCard}>
          {!selectedEmp ? (
            <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
              <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className={styles.textMuted}>Select an employee from the list to manage allowances.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEmp.FirstName} {selectedEmp.LastName}</h3>
                  <p className={styles.textMuted}>{MONTHS[month-1]} {year}</p>
                </div>
              </div>

              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Travel','Travel (₹)'],
                  ['Food','Food (₹)'],
                  ['Mobile','Mobile (₹)'],
                  ['Other','Other Allowance (₹)'],
                  ['Bonus','Bonus (₹)'],
                  ['OtherIncome','Other Income (₹)']
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className={styles.labelSm}>{label}</label>
                    <input
                      type="number"
                      className={styles.inputSm()}
                      value={form[field]}
                      min={0}
                      onChange={(e) => set(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={`mt-6 p-4 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-100 bg-blue-50/30'} flex items-center justify-between`}>
                <div>
                  <span className={styles.textMuted}>Total Additions</span>
                  <p className="text-xl font-bold text-green-600">₹{total.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={styles.btnPrimary}
                >
                  {saving ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
                  Save Allowances
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceManager;
