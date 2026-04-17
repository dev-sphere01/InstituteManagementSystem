import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { getEmsStyles } from '../../emsStyles';

const Step1BasicDetails = ({ data, onChange, onNext }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const [form, setForm] = useState({
    FirstName: data.FirstName || '',
    LastName: data.LastName || '',
    PhoneNumber: data.PhoneNumber || '',
    PersonalEmail: data.PersonalEmail || '',
    DateOfBirth: data.DateOfBirth || '',
    Gender: data.Gender || '',
    Address: data.Address || '',
    AadhaarNumber: data.AadhaarNumber || '',
    EmergencyContactNumber: data.EmergencyContactNumber || '',
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleNext = () => {
    const errs = {};
    if (!form.FirstName.trim()) errs.FirstName = 'First name is required.';
    if (!form.PhoneNumber.trim()) errs.PhoneNumber = 'Phone number is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onChange(form);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={styles.stepTitle}>Primary Identity</h2>
        <p className={styles.stepSubtitle}>Provide the essential personal information for the employee.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={styles.label}>First Name <span className="text-red-500 font-bold">*</span></label>
          <input className={styles.input(!!errors.FirstName)} value={form.FirstName} onChange={(e) => set('FirstName', e.target.value)} placeholder="e.g. Rahul" />
          {errors.FirstName && <p className={styles.error}>{errors.FirstName}</p>}
        </div>
        <div>
          <label className={styles.label}>Last Name</label>
          <input className={styles.input()} value={form.LastName} onChange={(e) => set('LastName', e.target.value)} placeholder="e.g. Sharma" />
        </div>
        <div>
          <label className={styles.label}>Primary Phone Number <span className="text-red-500 font-bold">*</span></label>
          <input className={styles.input(!!errors.PhoneNumber)} value={form.PhoneNumber} onChange={(e) => set('PhoneNumber', e.target.value)} placeholder="10-digit mobile" />
          {errors.PhoneNumber && <p className={styles.error}>{errors.PhoneNumber}</p>}
        </div>
        <div>
          <label className={styles.label}>Personal Email Address</label>
          <input type="email" className={styles.input()} value={form.PersonalEmail} onChange={(e) => set('PersonalEmail', e.target.value)} placeholder="rahul.sharma@email.com" />
        </div>
        <div>
          <label className={styles.label}>Date of Birth</label>
          <input type="date" className={styles.input()} value={form.DateOfBirth} onChange={(e) => set('DateOfBirth', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Gender Identity</label>
          <select className={styles.select()} value={form.Gender} onChange={(e) => set('Gender', e.target.value)}>
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other / Non-binary</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Aadhaar Number (UIDAI)</label>
          <input className={styles.input()} value={form.AadhaarNumber} maxLength={12} onChange={(e) => set('AadhaarNumber', e.target.value)} placeholder="12-digit number" />
        </div>
        <div>
          <label className={styles.label}>Emergency Contact Number</label>
          <input className={styles.input()} value={form.EmergencyContactNumber} onChange={(e) => set('EmergencyContactNumber', e.target.value)} placeholder="Family member contact" />
        </div>
        <div className="md:col-span-2">
          <label className={styles.label}>Current Residential Address</label>
          <textarea className={styles.input() + " min-h-[100px] resize-none"} rows={2} value={form.Address} onChange={(e) => set('Address', e.target.value)} placeholder="House number, street, city, pincode" />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleNext} className={styles.btnPrimary}>
          Proceed to Workplace Setup
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step1BasicDetails;
