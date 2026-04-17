import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Holding type drives which fields are required
const TYPE_INFO = {
  HalfMonth: { label: 'Half Month', desc: 'Hold 50% of monthly salary until end of a specified month.' },
  DaysWise:  { label: 'Days Wise',  desc: 'Hold salary for specific date range.' },
  Manual:    { label: 'Manual',     desc: 'Enter an explicit hold amount.' },
};

const HoldingManager = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { createHolding } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [holdingType, setHoldingType] = useState('HalfMonth');
  const [form, setForm] = useState({
    Month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
    FromDate: '',
    ToDate: '',
    Amount: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return `${e.FirstName} ${e.LastName}`.toLowerCase().includes(q) || e.EmpCode?.toLowerCase().includes(q);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        EmpID: Number(empId),
        HoldingType: holdingType,
        Month: form.Month,
        Year: form.Year,
        Status: 'Active',
      };
      if (holdingType === 'DaysWise') {
        payload.FromDate = form.FromDate;
        payload.ToDate = form.ToDate;
      }
      if (holdingType === 'Manual') {
        payload.Amount = Number(form.Amount);
      }
      await createHolding(payload);
      setSuccess('Holding created successfully.');
      setForm({ Month: new Date().getMonth() + 1, Year: new Date().getFullYear(), FromDate: '', ToDate: '', Amount: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create holding.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEmp = employees.find((e) => e.EmpID === Number(empId));

  return (
    <div>
      <h2 className={styles.stepTitle}>Create Holding</h2>
      <p className={styles.stepSubtitle}>Block a portion of salary from being processed.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Employee Selection */}
        <div className={styles.sectionCard}>
          <div className="relative mb-3">
            <input
              className={styles.inputSm()}
              placeholder="Search employee by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={`border rounded-xl overflow-y-auto max-h-96 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-white shadow-sm'}`}>
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

        {/* Right: Holding Form */}
        <div className={styles.sectionCard}>
          {!selectedEmp ? (
            <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
              <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className={styles.textMuted}>Select an employee from the list to create a holding.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEmp.FirstName} {selectedEmp.LastName}</h3>
              </div>

              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={styles.label}>Holding Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(TYPE_INFO).map(([key, { label }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setHoldingType(key)}
                        className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all border ${
                          holdingType === key
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                            : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs opacity-60 leading-relaxed italic">{TYPE_INFO[holdingType].desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={styles.labelSm}>Month</label>
                    <select className={styles.selectSm()} value={form.Month} onChange={(e) => set('Month', Number(e.target.value))}>
                      {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={styles.labelSm}>Year</label>
                    <select className={styles.selectSm()} value={form.Year} onChange={(e) => set('Year', Number(e.target.value))}>
                      {Array.from({ length: 5 }, (_, i) => form.Year - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {holdingType === 'DaysWise' && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className={styles.labelSm}>From Date *</label>
                      <input type="date" className={styles.inputSm()} value={form.FromDate} onChange={(e) => set('FromDate', e.target.value)} required />
                    </div>
                    <div>
                      <label className={styles.labelSm}>To Date *</label>
                      <input type="date" className={styles.inputSm()} value={form.ToDate} onChange={(e) => set('ToDate', e.target.value)} required />
                    </div>
                  </div>
                )}

                {holdingType === 'Manual' && (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <label className={styles.labelSm}>Hold Amount (₹) *</label>
                    <input type="number" className={styles.inputSm()} value={form.Amount} min={1} placeholder="0.00" onChange={(e) => set('Amount', e.target.value)} required />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={saving} className={styles.btnPrimary}>
                    {saving ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
                    Create Salary Holding
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldingManager;
