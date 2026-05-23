import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const SalaryAssignment = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { salaryHistory, fetchSalaryHistory, assignSalary } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [form, setForm] = useState({ MonthlySalary: '', EffectiveDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (empId) fetchSalaryHistory(empId); }, [empId]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      `${e.FirstName} ${e.LastName}`.toLowerCase().includes(q) ||
      e.EmpCode?.toLowerCase().includes(q)
    );
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!empId || !form.MonthlySalary || !form.EffectiveDate) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await assignSalary({ EmpID: Number(empId), MonthlySalary: Number(form.MonthlySalary), EffectiveDate: form.EffectiveDate });
      setSuccess('Salary assigned successfully.');
      setForm({ MonthlySalary: '', EffectiveDate: '' });
      fetchSalaryHistory(empId);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign salary.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEmp = employees.find((e) => e.EmpID === Number(empId));

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Salary Assignment</h2>
      <p className={styles.stepSubtitle}>Manage monthly base salary for employees.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Employee List */}
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <input
              className={styles.inputSm()}
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={`border rounded-xl overflow-y-auto max-h-[500px] ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-white shadow-sm'}`}>
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
                  <span className="text-sm">{emp.FirstName} {emp.LastName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>{emp.EmpCode}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm italic">No employees found.</div>
            )}
          </div>
        </div>

        {/* Right: Assignment & History */}
        <div className="lg:col-span-2">
          {!selectedEmp ? (
            <div className="flex flex-col items-center justify-center h-full py-20 border-2 border-dashed rounded-2xl border-gray-100 dark:border-gray-700 opacity-50">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className={styles.textMuted}>Select an employee to manage their salary configuration.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="pb-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedEmp.FirstName[0]}{selectedEmp.LastName[0]}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEmp.FirstName} {selectedEmp.LastName}</h3>
                  <p className={styles.textMuted}>{selectedEmp.Designation || 'Employee'} • {selectedEmp.EmpCode}</p>
                </div>
              </div>

              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}

              <form onSubmit={handleAssign} className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Assign New Salary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={styles.label}>Monthly Base Salary (₹) *</label>
                    <input
                      type="number"
                      className={styles.input()}
                      value={form.MonthlySalary}
                      onChange={(e) => setForm((f) => ({ ...f, MonthlySalary: e.target.value }))}
                      min={0}
                      required
                      placeholder="e.g. 25000"
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Effective Date *</label>
                    <input
                      type="date"
                      className={styles.input()}
                      value={form.EffectiveDate}
                      onChange={(e) => setForm((f) => ({ ...f, EffectiveDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={saving} className={styles.btnPrimary}>
                    {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Assigning...</> : 'Assign New Salary'}
                  </button>
                </div>
              </form>

              {/* History */}
              {salaryHistory.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Salary History</h4>
                  <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Effective Date</th>
                          <th className={styles.th}>Monthly Salary</th>
                          <th className={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryHistory.map((sh) => (
                          <tr key={sh.Id} className={styles.trHover}>
                            <td className={styles.td}>{sh.EffectiveDate?.split('T')[0]}</td>
                            <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{sh.MonthlySalary?.toLocaleString('en-IN')}</td>
                            <td className={styles.td}>
                              <span className={styles.badge(sh.IsActive ? 'green' : 'gray')}>
                                {sh.IsActive ? 'Active' : 'Previous'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryAssignment;
