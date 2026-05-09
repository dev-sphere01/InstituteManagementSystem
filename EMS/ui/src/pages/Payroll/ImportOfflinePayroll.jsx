import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import API from '@/services/API';
import notification from '@/services/NotificationService';
import ExcelImportService from '@/services/ExcelMappingService';

const ImportOfflinePayroll = () => {
  const notify = notification();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [mappedData, setMappedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null

  const years = useMemo(() => [...Array(10).keys()].map(i => new Date().getFullYear() - 5 + i), []);
  const months = useMemo(() => [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ], []);

  const predefinedFields = useMemo(() => [
    {
      key: 'EmpID',
      label: 'Employee ID',
      required: true,
      variations: ['empid', 'emp id', 'employee id', 'employeeid', 'id', 'emp_id']
    },
    {
      key: 'BasicSalary',
      label: 'Basic Salary',
      required: false,
      variations: ['basicsalary', 'basic salary', 'basic', 'basic_salary']
    },
    {
      key: 'SalaryAsPerHours',
      label: 'Salary as per Hours',
      required: false,
      variations: ['salary as per hours', 'salaryasperhours', 'salary per hours', 'hourly salary', 'salary_as_per_hours']
    },
    {
      key: 'ESI',
      label: 'ESI',
      required: false,
      variations: ['esi', 'employee state insurance']
    },
    {
      key: 'EPF',
      label: 'EPF',
      required: false,
      variations: ['epf', 'employee provident fund', 'pf']
    },
    {
      key: 'RD',
      label: 'RD',
      required: false,
      variations: ['rd', 'recurring deposit']
    },
    {
      key: 'Advances',
      label: 'Advances',
      required: false,
      variations: ['advances', 'advance', 'loan', 'loan advance']
    },
    {
      key: 'Deductions',
      label: 'Deductions',
      required: false,
      variations: ['deductions', 'deduction', 'total deductions']
    },
    {
      key: 'NetPay',
      label: 'Net Pay',
      required: false,
      variations: ['netpay', 'net pay', 'net salary', 'netsalary']
    },
    {
      key: 'Hours',
      label: 'Hours',
      required: false,
      variations: ['hours', 'total hours', 'totalhours', 'hrs', 'working hours']
    }
  ], []);

  const handleDataChange = useCallback((data) => {
    setMappedData(data);
    setImportResult(null);
    setImportStatus(null);
  }, []);

  const handleFileReset = useCallback(() => {
    setMappedData([]);
    setImportResult(null);
    setImportStatus(null);
  }, []);

  const toDecimal = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const handleImport = async () => {
    if (mappedData.length === 0) {
      notify.error('No data to import. Please upload and map your Excel file first.');
      return;
    }

    const transformed = mappedData
      .map((row) => {
        const empId = parseInt(row.EmpID);
        if (isNaN(empId) || empId <= 0) return null;
        return {
          EmpID: empId,
          BasicSalary: toDecimal(row.BasicSalary),
          SalaryAsPerHours: toDecimal(row.SalaryAsPerHours),
          ESI: toDecimal(row.ESI),
          EPF: toDecimal(row.EPF),
          RD: toDecimal(row.RD),
          Advances: toDecimal(row.Advances),
          Deductions: toDecimal(row.Deductions),
          NetPay: toDecimal(row.NetPay),
          Hours: toDecimal(row.Hours),
        };
      })
      .filter(Boolean);

    if (transformed.length === 0) {
      notify.error('No valid rows found. Ensure EmpID column is mapped and contains valid values.');
      return;
    }

    setIsImporting(true);
    try {
      const response = await API.post(
        `/OfflinePayroll/BulkImport?month=${selectedMonth}&year=${selectedYear}`,
        transformed
      );
      setImportStatus('success');
      setImportResult(response.data);
      notify.success(response.data.Message || 'Import successful.');
    } catch (error) {
      setImportStatus('error');
      const msg = error.response?.data?.Message || error.message || 'Import failed.';
      setImportResult({ Message: msg });
      notify.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const selectedMonthName = months.find(m => m.value === selectedMonth)?.name ?? '';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Import Offline Payroll</h1>
        </div>
        <p className="text-gray-600">
          Upload the offline payroll sheet for a selected month. Existing data for that period will be replaced.
        </p>
      </div>

      {/* Month / Year selectors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Period</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="border rounded-md px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border rounded-md px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <p className="text-sm text-gray-500 pb-2">
            Importing for: <span className="font-semibold text-gray-700">{selectedMonthName} {selectedYear}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Excel import widget */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Upload & Map Columns</h2>
            </div>
            <div className="p-4">
              <ExcelImportService
                predefinedFields={predefinedFields}
                onDataChange={handleDataChange}
                onFileReset={handleFileReset}
                headerRow={1}
              />
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <FileSpreadsheet className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-2 text-center">Expected Columns</h3>
            <ul className="text-xs text-gray-600 space-y-1 mb-4">
              <li><span className="font-medium">EMPID</span> — required</li>
              <li><span className="font-medium">BasicSalary</span></li>
              <li><span className="font-medium">Salary as per Hours</span></li>
              <li><span className="font-medium">ESI</span></li>
              <li><span className="font-medium">EPF</span></li>
              <li><span className="font-medium">RD</span></li>
              <li><span className="font-medium">Advances</span></li>
              <li><span className="font-medium">Deductions</span></li>
              <li><span className="font-medium">NetPay</span></li>
              <li><span className="font-medium">Hours</span></li>
            </ul>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
              Importing will <strong>replace</strong> any existing offline payroll data for {selectedMonthName} {selectedYear}.
            </p>
            <button
              onClick={handleImport}
              disabled={mappedData.length === 0 || isImporting}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                mappedData.length === 0 || isImporting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              }`}
            >
              <Upload size={16} />
              {isImporting ? 'Importing...' : `Import ${mappedData.length > 0 ? `(${mappedData.length} rows)` : ''}`}
            </button>
          </div>

          {/* Result panel */}
          {importStatus === 'success' && importResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <CheckCircle className="w-5 h-5" />
                Import Successful
              </div>
              <p className="text-sm text-green-700">{importResult.Message}</p>
              {importResult.Replaced > 0 && (
                <p className="text-xs text-green-600 mt-1">{importResult.Replaced} previous record(s) replaced.</p>
              )}
              {importResult.Errors?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="text-xs font-bold text-red-600">Skipped rows:</p>
                  <ul className="text-xs text-red-500 list-disc ml-4 mt-1">
                    {importResult.Errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {importStatus === 'error' && importResult && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                <AlertCircle className="w-5 h-5" />
                Import Failed
              </div>
              <p className="text-sm text-red-700">{importResult.Message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportOfflinePayroll;
