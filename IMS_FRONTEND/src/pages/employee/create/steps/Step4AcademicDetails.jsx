import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { getEmsStyles } from '../../emsStyles';

const Step4AcademicDetails = ({ data, onChange, onNext, onBack, onSkip }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const [rows, setRows] = useState(data.length ? data : [{ Degree: '', Institution: '', YearOfPassing: '', Percentage: '' }]);

  const currentYear = new Date().getFullYear();
  const [errors, setErrors] = useState({});

  const update = (idx, field, value) => {
    const updated = rows.map((row, i) => i === idx ? { ...row, [field]: value } : row);
    setRows(updated);
    if (errors[idx]) setErrors((e) => ({ ...e, [idx]: '' }));
    if (onChange) onChange(updated);
  };

  const addRow = () => {
    const updated = [...rows, { Degree: '', Institution: '', YearOfPassing: '', Percentage: '' }];
    setRows(updated);
    if (onChange) onChange(updated);
  };

  const removeRow = (idx) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    if (errors[idx]) setErrors((e) => ({ ...e, [idx]: '' }));
    if (onChange) onChange(updated);
  };

  const handleNext = () => {
    const newErrors = {};
    const validRows = rows.filter(r => r.Degree.trim());

    validRows.forEach((r, idx) => {
      const year = Number(r.YearOfPassing);
      if (year && year > currentYear) {
        newErrors[idx] = `Year cannot be greater than ${currentYear}.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onChange(validRows);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={styles.stepTitle}>Academic Background</h2>
        <p className={styles.stepSubtitle}>Provide educational qualifications of the employee.</p>
      </div>

      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'} relative animate-in zoom-in-95 duration-200`}>
            {rows.length > 1 && (
              <button onClick={() => removeRow(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pr-8">
              <div>
                <label className={styles.label}>Degree/Qualification</label>
                <input className={styles.input() + " uppercase"} value={row.Degree} onChange={(e) => update(idx, 'Degree', e.target.value.toUpperCase())} placeholder="e.g. MBA" />
              </div>
              <div>
                <label className={styles.label}>Institution/University</label>
                <input className={styles.input()} value={row.Institution} onChange={(e) => update(idx, 'Institution', e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={styles.label}>Year of Passing</label>
                <input type="number" max={currentYear} className={styles.input(!!errors[idx])} value={row.YearOfPassing} onChange={(e) => update(idx, 'YearOfPassing', e.target.value)} placeholder={String(currentYear)} />
                {errors[idx] && <p className={styles.error}>{errors[idx]}</p>}
              </div>
              <div>
                <label className={styles.label}>Score/Percentage (%)</label>
                <input type="number" className={styles.input()} value={row.Percentage} onChange={(e) => update(idx, 'Percentage', e.target.value)} placeholder="85.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRow} className={styles.btnGhost(isDarkMode) + " w-full border-2 border-dashed border-gray-100 dark:border-gray-800 py-3 font-bold"}>
        + Add Qualification Row
      </button>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={onSkip} className={styles.btnGhost(isDarkMode)}>Skip</button>
          <button onClick={handleNext} className={styles.btnPrimary}>
            Save & Continue
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4AcademicDetails;
