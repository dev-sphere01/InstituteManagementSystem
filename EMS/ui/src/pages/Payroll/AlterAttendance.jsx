import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { getHoursByEmployees, updateAttendanceTotalHours, importTotalHours, storeTotalAttendanceHours } from '@/services/Attendance/Attendance';
import { notification } from '@/services';

const monthNames = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

const buildYears = () => {
  const now = new Date();
  const y = now.getFullYear();
  const years = [];
  for (let i = y - 5; i <= y + 1; i++) years.push(i);
  return years.reverse();
};

const AlterAttendance = () => {
  const notify = notification();
  // Filters
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  // Data state
  const [rows, setRows] = useState([]); // API data with local editable field
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set()); // EmpIDs currently saving

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Store total hours state
  const [storing, setStoring] = useState(false);

  const years = useMemo(buildYears, []);

  const loadData = async (y, m) => {
    if (!y || !m) return;
    setLoading(true);
    try {
      const data = await getHoursByEmployees(y, m);
      const withEdit = (Array.isArray(data) ? data : []).map((r) => ({
        ...r,
        editTotalHours: r.StandardizedTotalHours ?? 0,
      }));
      setRows(withEdit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const handleHoursChange = (empId, value) => {
    setRows((prev) => prev.map((r) => (
      r.EmpID === empId ? { ...r, editTotalHours: value } : r
    )));
  };

  const saveRow = async (row) => {
    const y = Number(row.Year || year);
    const m = Number(row.Month || month);
    const hoursNum = Number(row.editTotalHours);

    if (!Number.isFinite(hoursNum)) return;
    if (hoursNum < 0) return;

    const newSet = new Set(savingIds);
    newSet.add(row.EmpID);
    setSavingIds(newSet);

    try {
      await updateAttendanceTotalHours({
        EmpID: row.EmpID,
        Year: y,
        Month: m,
        NewTotalHours: hoursNum,
      });
      // Reflect saved value in the table
      setRows((prev) => prev.map((r) => (
        r.EmpID === row.EmpID ? { ...r, TotalHours: hoursNum } : r
      )));
    } finally {
      setSavingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(row.EmpID);
        return copy;
      });
    }
  };

  // ===== Bulk Upload (Excel) =====
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { EmpID: '', TotalHours: '' },
    ], { header: ['EmpID', 'TotalHours'] });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'TotalHoursTemplate.xlsx');
  };

  const parseExcel = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });

  const handleImport = async () => {
    if (!uploadFile) {
      notify.error('Please choose an Excel file');
      return;
    }
    setUploading(true);
    try {
      const raw = await parseExcel(uploadFile);
      const prepared = raw
        .map((r) => ({
          EmpID: Number(r.EmpID),
          TotalHours: Number(r.TotalHours),
        }))
        .filter((r) => Number.isFinite(r.EmpID) && Number.isFinite(r.TotalHours) && r.TotalHours >= 0)
        .map((r) => ({ AthID: 0, EmpID: r.EmpID, Year: year, Month: month, TotalHours: r.TotalHours }));

      if (!prepared.length) {
        notify.warning('No valid rows found. Ensure columns: EmpID, TotalHours');
        return;
      }

      await importTotalHours(prepared);
      notify.success('Imported total hours successfully');
      setUploadFile(null);
      await loadData(year, month);
    } catch (err) {
      notify.error(err?.message || 'Failed to import file');
    } finally {
      setUploading(false);
    }
  };

  const handleStoreTotalHours = async () => {
    setStoring(true);
    try {
      await storeTotalAttendanceHours(year, month);
      await loadData(year, month);
    } catch (err) {
      notify.error(err?.message || 'Failed to store total attendance hours');
    } finally {
      setStoring(false);
    }
  };

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Alter Attendance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-gray-700">Year</span>
            <select
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded bg-white"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Month</span>
            <select
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded bg-white"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>{name}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => loadData(year, month)}
            >
              Refresh
            </button>
            <button
              className="px-4 py-2 border rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              onClick={handleStoreTotalHours}
              disabled={storing}
            >
              {storing ? 'Storing...' : 'Store Total Hours'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Bulk Upload Total Hours</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="block text-sm text-gray-700">Upload Excel (EmpID, TotalHours)</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="mt-1 block text-sm"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border rounded bg-gray-600 text-white hover:bg-gray-700"
              onClick={downloadTemplate}
            >
              Download Template
            </button>
            <button
              className="px-4 py-2 border rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              onClick={handleImport}
              disabled={!uploadFile || uploading}
            >
              {uploading ? 'Importing...' : 'Import Total Hours'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-0 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full table-fixed text-sm text-gray-800">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2 border-b w-[10%]">EmpID</th>
                <th className="px-3 py-2 border-b w-[30%]">Employee</th>
                <th className="px-3 py-2 border-b w-[10%]">Year</th>
                <th className="px-3 py-2 border-b w-[10%]">Month</th>
                <th className="px-3 py-2 border-b w-[20%]">Total Hours</th>
                <th className="px-3 py-2 border-b w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-500">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-700">No records</td></tr>
              ) : rows.map((r) => {
                const name = `${r.FirstName ?? ''} ${r.LastName ?? ''}`.trim() || '-';
                const isSaving = savingIds.has(r.EmpID);
                return (
                  <tr key={`${r.EmpID}-${r.Year}-${r.Month}`} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border-b">{r.EmpID}</td>
                    <td className="px-3 py-2 border-b">{name}</td>
                    <td className="px-3 py-2 border-b">{r.Year}</td>
                    <td className="px-3 py-2 border-b">{monthNames[(r.Month ?? month) - 1] || r.Month}</td>
                    <td className="px-3 py-2 border-b">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-32 px-2 py-1 border border-gray-300 rounded bg-white"
                        value={r.editTotalHours}
                        onChange={(e) => handleHoursChange(r.EmpID, e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 border-b">
                      <button
                        className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-60"
                        onClick={() => saveRow(r)}
                        disabled={isSaving || r.editTotalHours === ''}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlterAttendance;