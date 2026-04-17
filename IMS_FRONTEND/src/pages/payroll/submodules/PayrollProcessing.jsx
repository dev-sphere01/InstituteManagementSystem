import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

const PayrollProcessing = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { locations, fetchLocations } = useEmployeeStore();
  const { payrollRecords, fetchPayrollRecords, processPayroll, approvePayroll } = usePayrollStore();
  const [locationId, setLocationId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [processing, setProcessing] = useState(false);
  const [approving, setApproving] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchLocations(); }, []);
  useEffect(() => {
    if (locationId) fetchPayrollRecords(locationId, month, year);
  }, [locationId, month, year]);

  const handleProcess = async () => {
    if (!locationId) return;
    if (!window.confirm(`Process payroll for ${MONTHS[month-1]} ${year}? Existing draft records will be overwritten.`)) return;
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await processPayroll({ LocationId: locationId, Month: month, Year: year });
      setSuccess('Payroll processed successfully. Review records below.');
      fetchPayrollRecords(locationId, month, year);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this payroll record? Salary slip will become accessible.')) return;
    setApproving(id);
    try {
      await approvePayroll(id);
      fetchPayrollRecords(locationId, month, year);
    } catch {
      /* silently ignore — table will refresh */
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Process Payroll</h2>
      <p className={styles.stepSubtitle}>Calculate monthly salaries, deductions, and generate payroll records.</p>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-8 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex-1 min-w-[200px]">
          <label className={styles.labelSm}>Branch</label>
          <select className={styles.selectSm()} value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
            <option value="">Select Branch</option>
            {locations.map((l) => <option key={l.LocationID} value={l.LocationID}>{l.LocationName}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className={styles.labelSm}>Month</label>
          <select className={styles.selectSm()} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className={styles.labelSm}>Year</label>
          <select className={styles.selectSm()} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button
          onClick={handleProcess}
          disabled={processing || !locationId}
          className={styles.btnPrimary}
        >
          {processing ? (
            <><span className="loading loading-spinner loading-xs mr-2" /> Processing...</>
          ) : (
            'Run Payroll Calculation'
          )}
        </button>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}

      {!locationId ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl opacity-50 border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.textMuted}>Select a branch to view or process payroll.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Employee</th>
                <th className={styles.th}>Work Days</th>
                <th className={styles.th}>Present</th>
                <th className={styles.th}>Late</th>
                <th className={styles.th}>Earned</th>
                <th className={styles.th}>Additions</th>
                <th className={styles.th}>Deductions</th>
                <th className={styles.th}>Net Pay</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400 italic">
                    No payroll records found for this period.
                  </td>
                </tr>
              ) : payrollRecords.map((r) => (
                <tr key={r.Id} className={styles.trHover}>
                  <td className={`${styles.td} font-medium`}>{r.EmpName || r.EmpID}</td>
                  <td className={styles.td}>{r.WorkingDays}</td>
                  <td className={styles.td}>{r.PresentDays}</td>
                  <td className={styles.td}>{r.LateDays}</td>
                  <td className={styles.td}>{fmt(r.EarnedSalary)}</td>
                  <td className={`${styles.td} text-green-600`}>{fmt((r.Travel||0)+(r.Food||0)+(r.Mobile||0)+(r.OtherAllowance||0)+(r.Bonus||0)+(r.OtherIncome||0))}</td>
                  <td className={`${styles.td} text-red-600`}>{fmt((r.AbsentDeduction||0)+(r.HalfDayDeduction||0)+(r.TotalFine||0)+(r.HoldingAmount||0))}</td>
                  <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{fmt(r.NetPay)}</td>
                  <td className={styles.td}>
                    <span className={styles.badge(
                      r.Status === 'Approved' ? 'green' : r.Status === 'Processed' ? 'yellow' : 'gray'
                    )}>
                      {r.Status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {r.Status === 'Processed' && (
                      <button
                        onClick={() => handleApprove(r.Id)}
                        disabled={approving === r.Id}
                        className={styles.btnSuccessSm}
                      >
                        {approving === r.Id ? <span className="loading loading-spinner loading-xs" /> : 'Approve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PayrollProcessing;
