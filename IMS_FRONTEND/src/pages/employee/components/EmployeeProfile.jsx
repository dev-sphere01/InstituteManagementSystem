import React, { useEffect, useState } from 'react';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import CUPLEMS_API from '../../../services/CUPLEMS_API';

const EmployeeProfile = ({ empId, onBack, onEdit }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { currentEmployee, fetchEmployeeById, locations } = useEmployeeStore();
  const [bank, setBank] = useState(null);
  const [academic, setAcademic] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchEmployeeById(empId);
      try {
        const [bankRes, acadRes, expRes] = await Promise.allSettled([
          CUPLEMS_API.get(`/api/EmpBankDetails/${empId}`),
          CUPLEMS_API.get(`/api/EmpAcadDetails/${empId}`),
          CUPLEMS_API.get(`/api/EmpProfDetails/${empId}`),
        ]);
        if (bankRes.status === 'fulfilled') setBank(bankRes.value.data);
        if (acadRes.status === 'fulfilled') setAcademic(acadRes.value.data || []);
        if (expRes.status === 'fulfilled') setExperience(expRes.value.data || []);
      } catch { /* non-critical */ }
      setLoading(false);
    };
    load();
  }, [empId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="loading loading-spinner loading-lg text-blue-500 mb-4"></div>
      <p className={styles.textMuted}>Fetching employee profile...</p>
    </div>
  );

  if (!currentEmployee) return (
    <div className={styles.sectionCard + " text-center py-20"}>
      <p className={styles.alertError}>Employee not found or access denied.</p>
      <button onClick={onBack} className={styles.btnGhost(isDarkMode) + " mt-4"}>Return to Directory</button>
    </div>
  );

  const emp = currentEmployee;
  const locationName = locations.find((l) => l.LocationID === emp.LocationID)?.LocationName;

  const SectionCard = ({ title, icon, children }) => (
    <div className={styles.sectionCard + " h-full"}>
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        {icon && <span className="text-blue-500">{icon}</span>}
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value, full = false }) => (
    <div className={full ? "col-span-2" : ""}>
      <span className={`text-[10px] font-bold uppercase tracking-wider opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <p className={`font-semibold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Enhanced Header */}
      <div className={`${styles.sectionCard} !p-8`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center font-bold text-4xl shadow-xl ${isDarkMode ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-blue-600 text-white'}`}>
            {emp.FirstName[0]}{emp.LastName ? emp.LastName[0] : ''}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {emp.FirstName} {emp.LastName || ''}
              </h1>
              <span className={styles.badge(emp.IsActive ? 'green' : 'red')}>
                {emp.IsActive ? 'Active Member' : 'Inactive'}
              </span>
            </div>
            <p className={`${styles.textMuted} text-lg font-medium`}>
              {emp.Designation || 'Staff Member'} • <span className="font-mono text-sm">{emp.EmpCode || emp.EmpID}</span>
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /></svg>
                {locationName || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" /></svg>
                {emp.WorkEmail || emp.PersonalEmail || 'No Email'}
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" /></svg>
                Joined {emp.DateOfJoining || 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>Back</button>
            <button onClick={() => onEdit(emp.EmpID)} className={styles.btnPrimary}>Edit Profile</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Personal Information" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" /></svg>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Full Name" value={`${emp.FirstName} ${emp.LastName || ''}`} />
              <Field label="Gender" value={emp.Gender} />
              <Field label="Date of Birth" value={emp.DateOfBirth} />
              <Field label="Primary Phone" value={emp.PhoneNumber} />
              <Field label="Personal Email" value={emp.PersonalEmail} />
              <Field label="Blood Group" value={emp.BloodGroup} />
              <Field label="Aadhar Number" value={emp.AadharNumber} />
              <Field label="PAN Number" value={emp.PANNumber} />
              <Field label="Address" value={emp.Address} full />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academic.length > 0 && (
              <SectionCard title="Academic Qualifications" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2" /></svg>}>
                {academic.map((a, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{a.Degree}</p>
                    <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{a.Institution}</p>
                    <div className="flex justify-between items-center mt-2 opacity-60 text-xs font-bold">
                      <span>{a.YearOfPassing}</span>
                      <span>{a.Percentage}%</span>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}

            {experience.length > 0 && (
              <SectionCard title="Professional Experience" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" /></svg>}>
                {experience.map((exp, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{exp.JobTitle}</p>
                    <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{exp.Company}</p>
                    <p className="text-[10px] mt-2 opacity-60 font-bold uppercase tracking-wider">{exp.StartDate} – {exp.EndDate || 'Present'}</p>
                  </div>
                ))}
              </SectionCard>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard title="Work Assignment" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="2" /></svg>}>
            <div className="space-y-6">
              <Field label="Assigned Branch" value={locationName} />
              <Field label="Employee Type" value={emp.EmployeeType} />
              <Field label="Grade / Level" value={emp.Grade} />
              <Field label="Reporting To" value={emp.ReportingTo} />
            </div>
          </SectionCard>

          {bank && (
            <SectionCard title="Financial Details" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeWidth="2" /></svg>}>
              <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-gray-500' : 'text-blue-200 opacity-80'}`}>Salary Account</p>
                <div className="space-y-4">
                  <div>
                    <p className={`text-xs opacity-60 font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>Account Holder</p>
                    <p className="font-bold tracking-wide">{emp.FirstName} {emp.LastName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs opacity-60 font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>Bank Name</p>
                      <p className="font-bold text-sm">{bank.BankName}</p>
                    </div>
                    <div>
                      <p className={`text-xs opacity-60 font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>IFSC Code</p>
                      <p className="font-bold text-sm">{bank.IFSCCode}</p>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs opacity-60 font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>Account Number</p>
                    <p className="font-bold tracking-[0.1em]">{bank.AccountNumber?.replace(/\d(?=\d{4})/g, "•")}</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
