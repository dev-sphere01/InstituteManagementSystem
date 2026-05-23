import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';
import SalarySlipPrint from './SalarySlipPrint';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SalarySlip = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { fetchSalarySlip } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return `${e.FirstName} ${e.LastName}`.toLowerCase().includes(q) || e.EmpCode?.toLowerCase().includes(q);
  });

  const handleFetch = async () => {
    if (!empId) return;
    setLoading(true);
    setError('');
    setSlip(null);
    try {
      const data = await fetchSalarySlip(empId, month, year);
      setSlip(data);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'No approved payroll record found for this employee and month.'
        : (err.response?.data?.message || err.message || 'Failed to fetch salary slip.')
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = employees.find((e) => e.EmpID === Number(empId));

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Salary Slip</h2>
      <p className={styles.stepSubtitle}>View and print official salary slips for employees.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">
        {/* Employee Selection */}
        <div className="md:col-span-1">
          <label className={styles.labelSm}>Search Employee</label>
          <input
            className={styles.inputSm()}
            placeholder="Name or Emp Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={`mt-2 border rounded-xl overflow-y-auto max-h-56 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-white shadow-sm'}`}>
            {filtered.map((emp) => (
              <div
                key={emp.EmpID}
                onClick={() => { setEmpId(emp.EmpID); setSearch(''); setSlip(null); }}
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
              <div className="p-6 text-center text-gray-400 text-xs italic">No employees found.</div>
            )}
          </div>
        </div>

        {/* Period Selection */}
        <div className="md:col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={styles.labelSm}>Month</label>
              <select className={styles.selectSm()} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.labelSm}>Year</label>
              <select className={styles.selectSm()} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !empId}
            className={`w-full ${styles.btnPrimary}`}
          >
            {loading ? <><span className="loading loading-spinner loading-xs mr-2" /> Loading...</> : 'Fetch Salary Slip'}
          </button>
        </div>

        {/* Selected Info Card */}
        <div className="md:col-span-1">
          {selectedEmp ? (
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedEmp.FirstName[0]}{selectedEmp.LastName[0]}
                </div>
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEmp.FirstName} {selectedEmp.LastName}</h4>
                  <p className="text-xs opacity-60 uppercase tracking-wider">{selectedEmp.Designation || 'Employee'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                <span className={styles.textMuted}>Emp Code</span>
                <span className="font-semibold">{selectedEmp.EmpCode}</span>
              </div>
            </div>
          ) : (
            <div className={`p-10 rounded-xl border border-dashed flex flex-col items-center justify-center text-center opacity-40 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <p className="text-[10px] uppercase font-bold tracking-widest">Select an employee</p>
            </div>
          )}
        </div>
      </div>

      {error && <div className={`${styles.alertError} animate-in fade-in slide-in-from-top-2`}>{error}</div>}

      {slip && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <SalarySlipPrint
            slip={slip}
            empName={selectedEmp ? `${selectedEmp.FirstName} ${selectedEmp.LastName}` : ''}
            month={month}
            year={year}
          />
        </div>
      )}
    </div>
  );
};

export default SalarySlip;
