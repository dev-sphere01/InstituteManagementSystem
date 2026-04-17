import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { getEmsStyles } from '../../emsStyles';

const Step3BankDetails = ({ data, onChange, onNext, onBack, onSkip }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const [form, setForm] = useState({
    BankName: data.BankName || '',
    AccountNumber: data.AccountNumber || '',
    IFSCCode: data.IFSCCode || '',
    AccountType: data.AccountType || '',
  });

  const handleNext = () => {
    onChange(form);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={styles.stepTitle}>Financial Records</h2>
        <p className={styles.stepSubtitle}>Enter bank account details for payroll processing. This can be skipped and added later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={styles.label}>Bank Name</label>
          <input className={styles.input()} value={form.BankName} onChange={(e) => setForm({ ...form, BankName: e.target.value })} placeholder="e.g. State Bank of India" />
        </div>
        <div>
          <label className={styles.label}>Account Number</label>
          <input className={styles.input()} value={form.AccountNumber} onChange={(e) => setForm({ ...form, AccountNumber: e.target.value })} placeholder="Enter account number" />
        </div>
        <div>
          <label className={styles.label}>IFSC Code</label>
          <input className={styles.input()} value={form.IFSCCode} onChange={(e) => setForm({ ...form, IFSCCode: e.target.value })} placeholder="e.g. SBIN0001234" />
        </div>
        <div>
          <label className={styles.label}>Account Type</label>
          <select className={styles.select()} value={form.AccountType} onChange={(e) => setForm({ ...form, AccountType: e.target.value })}>
            <option value="">Select account type</option>
            <option>Savings</option>
            <option>Current</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={onSkip} className={styles.btnGhost(isDarkMode)}>Skip for Now</button>
          <button onClick={handleNext} className={styles.btnPrimary}>
            Next Step
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3BankDetails;
