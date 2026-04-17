import React from 'react';
import { useThemeStore } from '../../../../store';
import { getEmsStyles } from '../../emsStyles';
import useEmployeeStore from '../../../../store/useEmployeeStore';

const StepReview = ({ formData, onBack, onSubmit, submitting }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { locations, departments, positions, employeeTypes } = useEmployeeStore();

  const { basic, dept, bank, academic, experience } = formData;

  const Section = ({ title, children }) => (
    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
      <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const Info = ({ label, value }) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">{label}</p>
      <p className={`font-semibold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className={styles.stepTitle}>Final Review</h2>
        <p className={styles.stepSubtitle}>Verify all information before creating the employee record.</p>
      </div>

      <div className="space-y-6">
        <Section title="Basic Details">
          <Info label="Full Name" value={`${basic.FirstName} ${basic.LastName}`} />
          <Info label="Phone" value={basic.PhoneNumber} />
          <Info label="Personal Email" value={basic.PersonalEmail} />
          <Info label="Gender" value={basic.Gender} />
          <Info label="DOB" value={basic.DateOfBirth} />
          <Info label="Address" value={basic.Address} />
        </Section>

        <Section title="Workplace Details">
          <Info label="Branch" value={locations.find(l => l.LocationID === dept.LocationID)?.LocationName} />
          <Info label="Department" value={departments.find(d => d.DeptID === dept.DeptID)?.DeptName} />
          <Info label="Position" value={positions.find(p => p.PositionID === dept.PositionID)?.PositionName} />
          <Info label="Type" value={employeeTypes.find(t => t.EmpTypeID === dept.EmpTypeID)?.EmpTypeName} />
          <Info label="Joining Date" value={dept.DateOfJoining} />
          <Info label="Work Email" value={dept.WorkEmail} />
        </Section>

        {bank.BankName && (
          <Section title="Bank Details">
            <Info label="Bank" value={bank.BankName} />
            <Info label="A/C Number" value={bank.AccountNumber} />
            <Info label="IFSC" value={bank.IFSCCode} />
          </Section>
        )}

        {academic.length > 0 && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">Academic Qualifications</h3>
            <div className="space-y-3">
              {academic.map((a, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-700 pb-2">
                  <span className="font-bold">{a.Degree} <span className="opacity-50 font-medium">from {a.Institution}</span></span>
                  <span className="opacity-70 font-mono">{a.YearOfPassing} · {a.Percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onBack} disabled={submitting} className={styles.btnGhost(isDarkMode)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to Edit
        </button>
        <button onClick={onSubmit} disabled={submitting} className={styles.btnPrimary + " px-10"}>
          {submitting ? (
            <><span className="loading loading-spinner loading-xs mr-2" /> Finalizing...</>
          ) : (
            <>Confirm & Create Record</>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepReview;
