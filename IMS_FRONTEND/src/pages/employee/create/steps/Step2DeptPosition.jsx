import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../../store';
import { getEmsStyles } from '../../emsStyles';
import useEmployeeStore from '../../../../store/useEmployeeStore';

const Step2DeptPosition = ({ data, onChange, onNext, onBack }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { departments, positions, employeeTypes, locations, fetchPositions } = useEmployeeStore();

  const [form, setForm] = useState({
    LocationID: data.LocationID || '',
    DeptID: data.DeptID || '',
    PositionID: data.PositionID || '',
    EmpTypeID: data.EmpTypeID || '',
    DateOfJoining: data.DateOfJoining || '',
    WorkEmail: data.WorkEmail || '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (form.DeptID) fetchPositions(form.DeptID);
  }, [form.DeptID]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleNext = () => {
    const errs = {};
    if (!form.LocationID) errs.LocationID = 'Branch is required.';
    if (!form.DeptID) errs.DeptID = 'Department is required.';
    if (!form.PositionID) errs.PositionID = 'Position is required.';
    if (!form.EmpTypeID) errs.EmpTypeID = 'Employee type is required.';
    if (!form.DateOfJoining) errs.DateOfJoining = 'Joining date is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onChange(form);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={styles.stepTitle}>Workplace Configuration</h2>
        <p className={styles.stepSubtitle}>Assign the employee to their respective branch and department.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={styles.label}>Assigned Branch <span className="text-red-500 font-bold">*</span></label>
          <select className={styles.select(!!errors.LocationID)} value={form.LocationID} onChange={(e) => set('LocationID', Number(e.target.value))}>
            <option value="">Select branch</option>
            {locations.map((l) => <option key={l.LocationID} value={l.LocationID}>{l.LocationName}</option>)}
          </select>
          {errors.LocationID && <p className={styles.error}>{errors.LocationID}</p>}
        </div>
        <div>
          <label className={styles.label}>Department <span className="text-red-500 font-bold">*</span></label>
          <select className={styles.select(!!errors.DeptID)} value={form.DeptID} onChange={(e) => { set('DeptID', Number(e.target.value)); set('PositionID', ''); }}>
            <option value="">Select department</option>
            {departments.map((d) => <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>)}
          </select>
          {errors.DeptID && <p className={styles.error}>{errors.DeptID}</p>}
        </div>
        <div>
          <label className={styles.label}>Job Position / Title <span className="text-red-500 font-bold">*</span></label>
          <select className={styles.select(!!errors.PositionID)} value={form.PositionID} onChange={(e) => set('PositionID', Number(e.target.value))}>
            <option value="">Select position</option>
            {positions.map((p) => <option key={p.PositionID} value={p.PositionID}>{p.PositionName}</option>)}
          </select>
          {errors.PositionID && <p className={styles.error}>{errors.PositionID}</p>}
        </div>
        <div>
          <label className={styles.label}>Employment Type <span className="text-red-500 font-bold">*</span></label>
          <select className={styles.select(!!errors.EmpTypeID)} value={form.EmpTypeID} onChange={(e) => set('EmpTypeID', Number(e.target.value))}>
            <option value="">Select type</option>
            {employeeTypes.map((t) => <option key={t.EmpTypeID} value={t.EmpTypeID}>{t.EmpTypeName}</option>)}
          </select>
          {errors.EmpTypeID && <p className={styles.error}>{errors.EmpTypeID}</p>}
        </div>
        <div>
          <label className={styles.label}>Date of Joining <span className="text-red-500 font-bold">*</span></label>
          <input type="date" className={styles.input(!!errors.DateOfJoining)} value={form.DateOfJoining} onChange={(e) => set('DateOfJoining', e.target.value)} />
          {errors.DateOfJoining && <p className={styles.error}>{errors.DateOfJoining}</p>}
        </div>
        <div>
          <label className={styles.label}>Work Email Address</label>
          <input type="email" className={styles.input()} value={form.WorkEmail} onChange={(e) => set('WorkEmail', e.target.value)} placeholder="username@company.com" />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <button onClick={handleNext} className={styles.btnPrimary}>
          Proceed to Financials
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step2DeptPosition;
