import React, { useRef, useState } from 'react';
import CUPLEMS_API from '../../../services/CUPLEMS_API';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../../employee/emsStyles';

const REQUIRED_COLUMNS = ['EmpCode', 'Date', 'CheckInTime', 'CheckOutTime'];

const AttendanceImport = () => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const { locations } = useEmployeeStore();
  const [locationId, setLocationId] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { headers, rows }
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { success, failed, errors }
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
    setResult(null);
    setError('');
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const lines = ev.target.result.split('\n').filter(Boolean);
        if (lines.length < 2) { setError('File appears empty.'); return; }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1, 6).map((line) =>
          line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
        );
        setPreview({ headers, rows });
      };
      reader.readAsText(f);
    } else {
      setPreview({ headers: ['(Excel file — preview not available in browser)'], rows: [] });
    }
  };

  const handleUpload = async () => {
    if (!file || !locationId) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('locationId', locationId);
      const { data } = await CUPLEMS_API.post('/api/Attendances/Import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.stepTitle}>Import Attendance</h2>
      <p className={styles.stepSubtitle}>
        Upload a CSV or Excel file with attendance records. Required columns: <code className={`px-1 rounded ${isDarkMode ? 'bg-gray-900 text-blue-400' : 'bg-gray-100 text-blue-700'}`}>{REQUIRED_COLUMNS.join(', ')}</code>
      </p>

      {/* Branch + file selection */}
      <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className={styles.labelSm}>Branch *</label>
          <select
            className={styles.selectSm()}
            value={locationId}
            onChange={(e) => setLocationId(Number(e.target.value))}
          >
            <option value="">Select Branch</option>
            {locations.map((l) => (
              <option key={l.LocationID} value={l.LocationID}>
                {l.LocationName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={styles.labelSm}>File (.csv / .xlsx)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className={`block w-full text-sm ${isDarkMode ? 'text-gray-400 file:bg-gray-700 file:text-gray-300 file:border-gray-600' : 'text-gray-500 file:bg-gray-100 file:text-gray-700 file:border-gray-200'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold hover:file:bg-opacity-80 transition-all`}
            onChange={handleFile}
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !locationId}
          className={styles.btnPrimary}
        >
          {uploading ? (
            <><span className="loading loading-spinner loading-xs mr-2" /> Uploading...</>
          ) : (
            'Start Import'
          )}
        </button>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <h3 className={styles.sectionTitle}>File Preview (First 5 Rows)</h3>
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
            <table className={styles.table}>
              <thead>
                <tr>
                  {preview.headers.map((h, i) => (
                    <th key={i} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, ri) => (
                  <tr key={ri} className={styles.trHover}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={styles.td}>{cell}</td>
                    ))}
                  </tr>
                ))}
                {preview.rows.length === 0 && (
                  <tr>
                    <td colSpan={preview.headers.length} className="text-center py-6 text-gray-400 italic">
                      Excel preview not available in browser.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <div className={styles.alertError}>{error}</div>}

      {/* Result summary */}
      {result && (
        <div className="mb-6 animate-in zoom-in-95">
          <div className={styles.alertSuccess}>
            Import complete — <strong>{result.Success ?? result.success ?? 0}</strong> records imported,{' '}
            <strong>{result.Failed ?? result.failed ?? 0}</strong> failed.
          </div>
          {result.Errors?.length > 0 && (
            <div className={`mt-2 border rounded-xl p-4 text-xs font-mono space-y-1 max-h-48 overflow-y-auto ${isDarkMode ? 'bg-red-900/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <p className="font-bold uppercase tracking-widest mb-2 opacity-60">Error Log</p>
              {result.Errors.map((e, i) => (
                <div key={i} className="flex gap-2">
                  <span className="opacity-40">[{i+1}]</span>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceImport;
