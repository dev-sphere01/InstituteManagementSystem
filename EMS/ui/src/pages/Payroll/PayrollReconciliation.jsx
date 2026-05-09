import React, { useState, useMemo } from 'react';
import API from '@/services/API';
import notification from '@/services/NotificationService';
import TableService from '@/services/TableService';
import ExcelExporter from '@/services/ExportExcelService';
import { Calendar, GitCompareArrows } from 'lucide-react';

const PayrollReconciliation = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reconcileData, setReconcileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const years = useMemo(() => [...Array(10).keys()].map(i => new Date().getFullYear() - 5 + i), []);
  const months = useMemo(() => [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ], []);

  const handleReconcile = async () => {
    if (!selectedYear || !selectedMonth) {
      notification().error('Please select a valid month and year.');
      return;
    }
    setLoading(true);
    try {
      const response = await API.get(`/OfflinePayroll/Reconcile`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      setReconcileData(response.data);
      if (!response.data || response.data.length === 0) {
        notification().info('No reconciliation data found for the selected period.');
      }
    } catch (error) {
      notification().error('Failed to fetch reconciliation data.');
      setReconcileData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    value == null ? <span className="text-gray-400">N/A</span>
      : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const formatDiff = (value) => {
    if (value == null) return <span className="text-gray-400">N/A</span>;
    const num = typeof value === 'number' ? value : parseFloat(value);
    const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(num));
    if (num > 0) return <span className="text-red-600 font-semibold">+{formatted}</span>;
    if (num < 0) return <span className="text-green-600 font-semibold">-{formatted}</span>;
    return <span className="text-gray-500">{formatted}</span>;
  };

  const columns = useMemo(() => {
    if (!reconcileData || reconcileData.length === 0) return [];

    return [
      { accessorKey: 'EmpID', header: 'Emp ID', cell: ({ getValue }) => getValue() ?? <span className="text-gray-400">N/A</span> },
      { accessorKey: 'FirstName', header: 'Name', cell: ({ getValue }) => getValue() ?? <span className="text-gray-400">N/A</span> },

      // Basic Salary group
      { accessorKey: 'BasicSalary', header: 'Basic (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'BASIC SALARY OFFLINE', header: 'Basic (Offline)', cell: ({ row }) => formatCurrency(row.original['BASIC SALARY OFFLINE']) },
      { accessorKey: 'BasicSalary Diff', header: 'Basic Diff', cell: ({ row }) => formatDiff(row.original['BasicSalary Diff']) },

      // ESI group
      { accessorKey: 'ESI', header: 'ESI (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'ESI OFFLINE', header: 'ESI (Offline)', cell: ({ row }) => formatCurrency(row.original['ESI OFFLINE']) },
      { accessorKey: 'ESI Diff', header: 'ESI Diff', cell: ({ row }) => formatDiff(row.original['ESI Diff']) },

      // EPF group
      { accessorKey: 'EPF', header: 'EPF (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'EPF OFFLINE', header: 'EPF (Offline)', cell: ({ row }) => formatCurrency(row.original['EPF OFFLINE']) },
      { accessorKey: 'EPF Diff', header: 'EPF Diff', cell: ({ row }) => formatDiff(row.original['EPF Diff']) },

      // Deductions group
      { accessorKey: 'Deductions', header: 'Deductions (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'DeductionOFFLINE', header: 'Deductions (Offline)', cell: ({ row }) => formatCurrency(row.original['DeductionOFFLINE']) },
      { accessorKey: 'DeductionDiff', header: 'Deduction Diff', cell: ({ row }) => formatDiff(row.original['DeductionDiff']) },

      // Loan / Advance group
      { accessorKey: 'LoanRepayment', header: 'Loan (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'LOAN OFFLINE', header: 'Loan (Offline)', cell: ({ row }) => formatCurrency(row.original['LOAN OFFLINE']) },
      { accessorKey: 'Loan Diff', header: 'Loan Diff', cell: ({ row }) => formatDiff(row.original['Loan Diff']) },

      // RD group
      { accessorKey: 'RD', header: 'RD (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'RD OFFLINE', header: 'RD (Offline)', cell: ({ row }) => formatCurrency(row.original['RD OFFLINE']) },
      { accessorKey: 'RD Diff', header: 'RD Diff', cell: ({ row }) => formatDiff(row.original['RD Diff']) },

      // Net Pay group
      { accessorKey: 'NetPay', header: 'Net Pay (System)', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'NETPAY OFFLINE', header: 'Net Pay (Offline)', cell: ({ row }) => formatCurrency(row.original['NETPAY OFFLINE']) },
      { accessorKey: 'NetPay Diff', header: 'Net Pay Diff', cell: ({ row }) => formatDiff(row.original['NetPay Diff']) },

      { accessorKey: 'TotalHours', header: 'Hours (System)', cell: ({ getValue }) => getValue() ?? <span className="text-gray-400">N/A</span> },
      { accessorKey: 'HOURS OFFLINE', header: 'Hours (Offline)', cell: ({ row }) => row.original['HOURS OFFLINE'] ?? <span className="text-gray-400">N/A</span> },
      { accessorKey: 'Hours Diff', header: 'Hours Diff', cell: ({ row }) => formatDiff(row.original['Hours Diff']) },
    ];
  }, [reconcileData]);

  const selectedMonthName = months.find(m => m.value === selectedMonth)?.name ?? '';

  const exportData = useMemo(() => {
    if (!reconcileData) return [];
    return reconcileData.map(row => ({
      'Emp ID':                   row['EmpID'],
      'Name':                     row['FirstName'],
      'Basic Salary (System)':    row['BasicSalary'],
      'HRA':                      row['HRA'],
      'DA':                       row['DA'],
      'Basic Salary (Offline)':   row['BASIC SALARY OFFLINE'],
      'Basic Salary Diff':        row['BasicSalary Diff'],
      'ESI (System)':             row['ESI'],
      'ESI (Offline)':            row['ESI OFFLINE'],
      'ESI Diff':                 row['ESI Diff'],
      'EPF (System)':             row['EPF'],
      'EPF (Offline)':            row['EPF OFFLINE'],
      'EPF Diff':                 row['EPF Diff'],
      'Deductions (System)':      row['Deductions'],
      'Deductions (Offline)':     row['DeductionOFFLINE'],
      'Deductions Diff':          row['DeductionDiff'],
      'Loan (System)':            row['LoanRepayment'],
      'Loan (Offline)':           row['LOAN OFFLINE'],
      'Loan Diff':                row['Loan Diff'],
      'RD (System)':              row['RD'],
      'RD (Offline)':             row['RD OFFLINE'],
      'RD Diff':                  row['RD Diff'],
      'Net Pay (System)':         row['NetPay'],
      'Net Pay (Offline)':        row['NETPAY OFFLINE'],
      'Net Pay Diff':             row['NetPay Diff'],
      'Hours (System)':           row['TotalHours'],
      'Hours (Offline)':          row['HOURS OFFLINE'],
      'Hours Diff':               row['Hours Diff'],
    }));
  }, [reconcileData]);

  const exportSheetConfigs = [{ sheetName: 'Reconciliation', filter: () => true }];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payroll Reconciliation</h1>
          <p className="text-gray-600">Compare system-generated payroll against the offline payroll sheet for a given month.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">

          <div>
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <div className="relative">
              <select
                id="year-select"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <div className="relative">
              <select
                id="month-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleReconcile}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white font-semibold transition w-full md:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <GitCompareArrows size={16} />
            {loading ? 'Loading...' : 'Reconcile'}
          </button>

          <ExcelExporter
            data={exportData}
            sheetConfigs={exportSheetConfigs}
            fileName={`Reconciliation_${selectedMonthName}_${selectedYear}.xlsx`}
            disabled={!reconcileData || reconcileData.length === 0}
          />

        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <p>Fetching reconciliation data...</p>
        </div>
      ) : reconcileData && reconcileData.length > 0 ? (
        <>
          <div className="mb-3 text-sm text-gray-600">
            Showing reconciliation for <span className="font-semibold">{selectedMonthName} {selectedYear}</span> — {reconcileData.length} employee(s)
          </div>
          <div className="text-xs text-gray-500 mb-2 flex gap-4">
            <span><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span>Positive diff = system paid more</span>
            <span><span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span>Negative diff = offline paid more</span>
          </div>
          <TableService
            columns={columns}
            data={reconcileData}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            initialPageSize={15}
            serverPagination={false}
          />
        </>
      ) : reconcileData !== null ? (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700">No Data Found</h3>
          <p className="text-gray-500 mt-2">No payroll records found for {selectedMonthName} {selectedYear}.</p>
          <p className="text-gray-500 mt-1">Ensure both the system payroll and offline payroll sheet have been entered for this period.</p>
        </div>
      ) : null}
    </div>
  );
};

export default PayrollReconciliation;
