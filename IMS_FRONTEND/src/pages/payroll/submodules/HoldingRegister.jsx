import React, { useEffect, useState } from 'react';
import usePayrollStore from '../../../store/usePayrollStore';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const HoldingRegister = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { employees, fetchEmployees } = useEmployeeStore();
  const { holdings, fetchHoldings, releaseHolding, cancelHolding, reduceHolding } = usePayrollStore();
  const [empId, setEmpId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reduceModal, setReduceModal] = useState(null); // holding id
  const [reduceAmount, setReduceAmount] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (empId) fetchHoldings(empId, month, year); }, [empId, month, year]);

  const act = async (fn) => {
    setActioning(true);
    await fn().catch(() => {});
    fetchHoldings(empId, month, year);
    setActioning(false);
  };

  const handleReduce = async () => {
    if (!reduceAmount) return;
    await act(() => reduceHolding(reduceModal, Number(reduceAmount)));
    setReduceModal(null);
    setReduceAmount('');
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Holding Register</h2>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className={styles.labelSm}>Employee</label>
          <select className={styles.selectSm()} value={empId} onChange={(e) => setEmpId(e.target.value)}>
            <option value="">Select Employee</option>
            {employees.map((e) => <option key={e.EmpID} value={e.EmpID}>{e.FirstName} {e.LastName} ({e.EmpCode})</option>)}
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
      </div>

      {!empId ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl border-gray-100 dark:border-gray-700 opacity-50">
          <p className={styles.textMuted}>Select an employee to view their salary holdings.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Period</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic">No holdings found for this period.</td></tr>
              ) : holdings.map((h) => (
                <tr key={h.Id} className={styles.trHover}>
                  <td className={styles.td}>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {h.HoldingType}
                    </span>
                  </td>
                  <td className={`${styles.td} font-bold text-blue-600`}>₹{h.Amount?.toLocaleString('en-IN')}</td>
                  <td className={`${styles.td} text-xs ${styles.textMuted}`}>
                    {h.FromDate ? `${h.FromDate.split('T')[0]} → ${h.ToDate?.split('T')[0]}` : `${MONTHS[(h.Month||1)-1]} ${h.Year}`}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badge(
                      h.Status === 'Released' ? 'green' : h.Status === 'Active' ? 'yellow' : h.Status === 'Reduced' ? 'blue' : 'gray'
                    )}>
                      {h.Status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {h.Status === 'Active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => act(() => releaseHolding(h.Id))}
                          disabled={actioning}
                          className="text-[10px] font-bold uppercase tracking-wider text-green-600 hover:text-green-700 underline"
                        >Release</button>
                        <button
                          onClick={() => setReduceModal(h.Id)}
                          disabled={actioning}
                          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 underline"
                        >Reduce</button>
                        <button
                          onClick={() => act(() => cancelHolding(h.Id))}
                          disabled={actioning}
                          className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 underline"
                        >Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reduceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Reduce Holding Amount</h3>
            <div className="mb-6">
              <label className={styles.label}>Reduced Amount (₹)</label>
              <input
                type="number"
                className={styles.input()}
                value={reduceAmount}
                min={1}
                placeholder="Enter new lower amount"
                onChange={(e) => setReduceAmount(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500 italic">This will update the current holding amount.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setReduceModal(null); setReduceAmount(''); }} className={styles.btnGhost(isDarkMode)}>Cancel</button>
              <button onClick={handleReduce} disabled={actioning} className={styles.btnPrimary}>
                {actioning ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
                Update Amount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingRegister;
