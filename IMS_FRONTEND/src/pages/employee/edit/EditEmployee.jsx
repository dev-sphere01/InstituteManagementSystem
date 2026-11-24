import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { getEmsStyles } from '../emsStyles';
import CUPLEMS_API from '../../../services/CUPLEMS_API';

const TABS = ['Basic', 'Dept & Position', 'Bank', 'Academic', 'Experience'];

// ── Basic Tab ────────────────────────────────────────────────────────────────
// ── Basic Tab ────────────────────────────────────────────────────────────────
const BasicTab = ({ emp, onSaved, styles, isDarkMode }) => {
  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    PersonalEmail: '',
    PhoneNumber: '',
    Address: '',
    DateOfBirth: '',
    Gender: '',
    EmergencyContactNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (emp) {
      setForm({
        FirstName: emp.FirstName || '',
        LastName: emp.LastName || '',
        PersonalEmail: emp.PersonalEmail || '',
        PhoneNumber: emp.PhoneNumber || '',
        Address: emp.Address || '',
        DateOfBirth: emp.DateOfBirth ? emp.DateOfBirth.split('T')[0] : '',
        Gender: emp.Gender || '',
        EmergencyContactNumber: emp.EmergencyContactNumber || emp.EmergencyContact || '',
      });
    }
  }, [emp]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    if (!form.FirstName?.trim()) {
      setError('First name is required.');
      setSaving(false);
      return;
    }
    if (!form.PhoneNumber?.trim()) {
      setError('Phone number is required.');
      setSaving(false);
      return;
    }

    try {
      await CUPLEMS_API.put(`/api/Employees/${emp.EmpID}`, {
        EmpID: emp.EmpID,
        FirstName: form.FirstName,
        LastName: form.LastName,
        PhoneNumber: form.PhoneNumber,
        PersonalEmail: form.PersonalEmail,
        DateOfBirth: form.DateOfBirth || null,
        Gender: form.Gender,
        EmergencyContactNumber: form.EmergencyContactNumber,
        Address: form.Address,
      });
      setSuccess('Basic details saved successfully.');
      onSaved();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={styles.label}>First Name *</label>
          <input className={styles.input()} value={form.FirstName} onChange={(e) => set('FirstName', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Last Name</label>
          <input className={styles.input()} value={form.LastName} onChange={(e) => set('LastName', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Phone *</label>
          <input className={styles.input()} value={form.PhoneNumber} onChange={(e) => set('PhoneNumber', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Personal Email</label>
          <input type="email" className={styles.input()} value={form.PersonalEmail} onChange={(e) => set('PersonalEmail', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Date of Birth</label>
          <input type="date" className={styles.input()} value={form.DateOfBirth} onChange={(e) => set('DateOfBirth', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Gender</label>
          <select className={styles.select()} value={form.Gender} onChange={(e) => set('Gender', e.target.value)}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Emergency Contact</label>
          <input className={styles.input()} value={form.EmergencyContactNumber} onChange={(e) => set('EmergencyContactNumber', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={styles.label}>Address</label>
          <textarea className={styles.input() + " min-h-[80px] resize-none"} rows={2} value={form.Address} onChange={(e) => set('Address', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Basic Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Dept & Position Tab ──────────────────────────────────────────────────────
const DeptTab = ({ emp, onSaved, styles, isDarkMode }) => {
  const { departments, positions, employeeTypes, locations } = useEmployeeStore();
  const [edpID, setEdpID] = useState(null);
  const [form, setForm] = useState({
    DeptID: '',
    PositionID: '',
    EmpTypeID: '',
    LocationID: '',
    DateOfJoining: '',
    WorkEmail: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (emp) {
      setForm((f) => ({
        ...f,
        LocationID: emp.LocationID || '',
        DateOfJoining: emp.DateOfJoining ? emp.DateOfJoining.split('T')[0] : '',
        WorkEmail: emp.WorkEmail || '',
      }));
    }
  }, [emp]);

  useEffect(() => {
    if (!emp?.EmpID) return;
    CUPLEMS_API.get(`/api/EmpDeptPos/${emp.EmpID}`)
      .then(({ data }) => {
        const latest = Array.isArray(data) ? data[data.length - 1] : data;
        if (latest) {
          setEdpID(latest.EdpID ?? latest.edpID);
          setForm((f) => ({
            ...f,
            DeptID: latest.DeptID ?? latest.deptID ?? '',
            PositionID: latest.PositionID ?? latest.positionID ?? '',
            EmpTypeID: latest.EmpTypeID ?? latest.empTypeID ?? '',
          }));
        }
      })
      .catch(() => {});
  }, [emp?.EmpID]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    if (!form.DeptID || !form.PositionID) {
      setError('Please select both a Department and a Position before saving.');
      setSaving(false);
      return;
    }

    try {
      await CUPLEMS_API.put(`/api/Employees/${emp.EmpID}`, {
        EmpID: emp.EmpID,
        LocationID: form.LocationID ? Number(form.LocationID) : null,
        DateOfJoining: form.DateOfJoining || null,
        WorkEmail: form.WorkEmail,
      });

      const edpPayload = {
        EmpID: emp.EmpID,
        DeptID: Number(form.DeptID),
        PositionID: Number(form.PositionID),
        EmpTypeID: form.EmpTypeID ? Number(form.EmpTypeID) : null,
      };

      if (edpID) {
        await CUPLEMS_API.put(`/api/EmpDeptPos/${edpID}`, {
          EdpID: edpID,
          ...edpPayload,
        });
      } else {
        const res = await CUPLEMS_API.post('/api/EmpDeptPos', edpPayload);
        if (res?.data?.EdpID || res?.data?.edpID) {
          setEdpID(res.data.EdpID || res.data.edpID);
        }
      }
      setSuccess('Work & Position details saved successfully.');
      onSaved();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={styles.label}>Branch</label>
          <select className={styles.select()} value={form.LocationID} onChange={(e) => set('LocationID', Number(e.target.value))}>
            <option value="">Select Branch</option>
            {locations.map((l) => <option key={l.LocationID} value={l.LocationID}>{l.LocationName}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label}>Department *</label>
          <select className={styles.select()} value={form.DeptID} onChange={(e) => set('DeptID', Number(e.target.value))}>
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label}>Position *</label>
          <select className={styles.select()} value={form.PositionID} onChange={(e) => set('PositionID', Number(e.target.value))}>
            <option value="">Select Position</option>
            {positions.map((p) => <option key={p.PositionID} value={p.PositionID}>{p.PositionName}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label}>Employee Type</label>
          <select className={styles.select()} value={form.EmpTypeID} onChange={(e) => set('EmpTypeID', Number(e.target.value))}>
            <option value="">Select Type</option>
            {employeeTypes.map((t) => <option key={t.EmpTypeID} value={t.EmpTypeID}>{t.EmpTypeName}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label}>Date of Joining</label>
          <input type="date" className={styles.input()} value={form.DateOfJoining} onChange={(e) => set('DateOfJoining', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Work Email</label>
          <input type="email" className={styles.input()} value={form.WorkEmail} onChange={(e) => set('WorkEmail', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Work Details'}
        </button>
      </div>
    </div>
  );
};

// ── Bank Tab ─────────────────────────────────────────────────────────────────
const BankTab = ({ emp, styles, isDarkMode }) => {
  const [bankID, setBankID] = useState(null);
  const [form, setForm] = useState({ BankName: '', AccountNumber: '', IFSCCode: '', BranchName: '', AccountType: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    CUPLEMS_API.get(`/api/EmpBankDetails/${emp.EmpID}`)
      .then(({ data }) => {
        const rec = Array.isArray(data) ? data[0] : data;
        if (rec) {
          setBankID(rec.EbdID ?? rec.ebdID ?? rec.BankDetailID ?? rec.Id ?? rec.EmpBankDetailID);
          setForm({
            BankName: rec.BankName || '',
            AccountNumber: rec.AccountNumber || '',
            IFSCCode: rec.IFSCCode || '',
            BranchName: rec.BranchName || '',
            AccountType: rec.AccountType || '',
          });
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [emp.EmpID]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    if (!form.BankName?.trim()) {
      setError('Bank Name is required.');
      setSaving(false);
      return;
    }
    if (!form.AccountNumber?.trim()) {
      setError('Account Number is required.');
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('EmpID', emp.EmpID);
      formData.append('BankName', form.BankName || '');
      formData.append('AccountNumber', form.AccountNumber || '');
      formData.append('IFSCCode', form.IFSCCode || '');
      formData.append('BranchName', form.BranchName || form.AccountType || '');

      await CUPLEMS_API.post('/api/EmpBankDetails', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Bank details saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-blue-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={styles.label}>Bank Name *</label>
          <input className={styles.input()} value={form.BankName} onChange={(e) => set('BankName', e.target.value)} placeholder="e.g. State Bank of India" />
        </div>
        <div>
          <label className={styles.label}>Account Number *</label>
          <input className={styles.input()} value={form.AccountNumber} onChange={(e) => set('AccountNumber', e.target.value)} placeholder="Enter 12-16 digit number" />
        </div>
        <div>
          <label className={styles.label}>IFSC Code</label>
          <input className={styles.input()} value={form.IFSCCode} onChange={(e) => set('IFSCCode', e.target.value)} placeholder="e.g. SBIN0001234" />
        </div>
        <div>
          <label className={styles.label}>Account Type</label>
          <select className={styles.select()} value={form.AccountType} onChange={(e) => set('AccountType', e.target.value)}>
            <option value="">Select Account Type</option>
            <option>Savings</option>
            <option>Current</option>
            <option>Salary</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Bank Details'}
        </button>
      </div>
    </div>
  );
};

// ── Academic Tab ─────────────────────────────────────────────────────────────
const AcademicTab = ({ emp, styles, isDarkMode }) => {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    CUPLEMS_API.get(`/api/EmpAcadDetails/${emp.EmpID}`)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        setRows(list.map((r) => ({
          EadID: r.EadID ?? r.eadID ?? r.AcadDetailID ?? r.Id,
          Degree: r.Degree || r.Qualification || '',
          Institution: r.Institution || '',
          YearOfPassing: r.YearOfPassing || '',
          Percentage: r.Percentage || r.Grade || '',
        })));
      })
      .catch(() => {});
  }, [emp.EmpID]);

  const update = (idx, field, value) => setRows((r) => r.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  const addRow = () => setRows((r) => [...r, { Degree: '', Institution: '', YearOfPassing: '', Percentage: '' }]);
  const removeRow = async (idx) => {
    const row = rows[idx];
    if (row?.EadID) {
      try {
        await CUPLEMS_API.delete(`/api/EmpAcadDetails/${row.EadID}`);
      } catch (e) {
        console.error('Failed to delete academic row:', e);
      }
    }
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const currentYear = new Date().getFullYear();

  const handleSave = async () => {
    setError('');
    setSuccess('');
    for (const r of rows) {
      const yr = Number(r.YearOfPassing);
      if (yr && yr > currentYear) {
        setError(`Year of passing cannot be greater than ${currentYear}.`);
        return;
      }
    }

    setSaving(true);
    try {
      for (const row of rows) {
        if (!row.Degree?.trim()) continue;
        const payload = {
          EmpID: emp.EmpID,
          Degree: row.Degree,
          Qualification: row.Degree,
          Institution: row.Institution,
          YearOfPassing: row.YearOfPassing ? String(row.YearOfPassing) : '',
          Grade: row.Percentage ? String(row.Percentage) : '',
        };
        if (row.EadID) {
          await CUPLEMS_API.put(`/api/EmpAcadDetails/${row.EadID}`, { EadID: row.EadID, ...payload });
        } else {
          const res = await CUPLEMS_API.post('/api/EmpAcadDetails', payload);
          if (res?.data?.EadID || res?.data?.eadID) {
            row.EadID = res.data.EadID || res.data.eadID;
          }
        }
      }
      setSuccess('Academic details saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}
      {rows.map((row, idx) => (
        <div key={idx} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'} relative`}>
          <button onClick={() => removeRow(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-8">
            <div>
              <label className={styles.label}>Degree/Course</label>
              <input className={styles.input() + " uppercase"} value={row.Degree || ''} onChange={(e) => update(idx, 'Degree', e.target.value.toUpperCase())} placeholder="e.g. B.TECH" />
            </div>
            <div>
              <label className={styles.label}>Institution</label>
              <input className={styles.input()} value={row.Institution || ''} onChange={(e) => update(idx, 'Institution', e.target.value)} placeholder="University name" />
            </div>
            <div>
              <label className={styles.label}>Year</label>
              <input type="number" max={currentYear} className={styles.input()} value={row.YearOfPassing || ''} onChange={(e) => update(idx, 'YearOfPassing', e.target.value)} placeholder={String(currentYear)} />
            </div>
            <div>
              <label className={styles.label}>Percentage (%)</label>
              <input type="number" className={styles.input()} value={row.Percentage || ''} onChange={(e) => update(idx, 'Percentage', e.target.value)} placeholder="85" />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className={styles.btnGhost(isDarkMode) + " w-full border-2 border-dashed border-gray-100 dark:border-gray-800 py-3"}>
        + Add New Academic Record
      </button>
      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Academic Details'}
        </button>
      </div>
    </div>
  );
};

// ── Experience Tab ────────────────────────────────────────────────────────────
const ExperienceTab = ({ emp, styles, isDarkMode }) => {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    CUPLEMS_API.get(`/api/EmpProfDetails/${emp.EmpID}`)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        setRows(list.map((r) => ({
          EpdID: r.EpdID ?? r.epdID ?? r.ProfDetailID ?? r.Id,
          Company: r.PreviousCompany || r.Company || '',
          JobTitle: r.PreviousPosition || r.JobTitle || '',
          Description: r.PreviousExperience || r.Description || '',
          StartDate: r.StartDate || '',
          EndDate: r.EndDate || '',
        })));
      })
      .catch(() => {});
  }, [emp.EmpID]);

  const update = (idx, field, value) => setRows((r) => r.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  const addRow = () => setRows((r) => [...r, { Company: '', JobTitle: '', StartDate: '', EndDate: '', Description: '' }]);
  const removeRow = async (idx) => {
    const row = rows[idx];
    if (row?.EpdID) {
      try {
        await CUPLEMS_API.delete(`/api/EmpProfDetails/${row.EpdID}`);
      } catch (e) {
        console.error('Failed to delete experience row:', e);
      }
    }
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      for (const row of rows) {
        if (!row.Company?.trim()) continue;
        const payload = {
          EmpID: emp.EmpID,
          PreviousCompany: row.Company,
          PreviousPosition: row.JobTitle,
          PreviousExperience: row.Description || (row.StartDate ? `${row.StartDate} to ${row.EndDate || 'Present'}` : ''),
        };
        if (row.EpdID) {
          await CUPLEMS_API.put(`/api/EmpProfDetails/${row.EpdID}`, { EpdID: row.EpdID, ...payload });
        } else {
          const res = await CUPLEMS_API.post('/api/EmpProfDetails', payload);
          if (res?.data?.EpdID || res?.data?.epdID) {
            row.EpdID = res.data.EpdID || res.data.epdID;
          }
        }
      }
      setSuccess('Experience details saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && <div className={styles.alertError}>{error}</div>}
      {rows.map((row, idx) => (
        <div key={idx} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'} relative`}>
          <button onClick={() => removeRow(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={styles.label}>Company</label>
              <input className={styles.input()} value={row.Company || ''} onChange={(e) => update(idx, 'Company', e.target.value)} placeholder="Company Name" />
            </div>
            <div>
              <label className={styles.label}>Job Title</label>
              <input className={styles.input()} value={row.JobTitle || ''} onChange={(e) => update(idx, 'JobTitle', e.target.value)} placeholder="Designation" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={styles.label}>From</label>
                <input type="date" className={styles.input()} value={row.StartDate ? row.StartDate.split('T')[0] : ''} onChange={(e) => update(idx, 'StartDate', e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>To</label>
                <input type="date" className={styles.input()} value={row.EndDate ? row.EndDate.split('T')[0] : ''} onChange={(e) => update(idx, 'EndDate', e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label className={styles.label}>Key Responsibilities</label>
            <input className={styles.input()} value={row.Description || ''} onChange={(e) => update(idx, 'Description', e.target.value)} placeholder="Briefly describe your role..." />
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className={styles.btnGhost(isDarkMode) + " w-full border-2 border-dashed border-gray-100 dark:border-gray-800 py-3"}>
        + Add Work Experience
      </button>
      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving} className={styles.btnPrimary}>
          {saving ? <><span className="loading loading-spinner loading-xs mr-2" /> Saving...</> : 'Save Experience Details'}
        </button>
      </div>
    </div>
  );
};

// ── Root Component ───────────────────────────────────────────────────────────
const EditEmployee = ({ empId, onBack, onSaved }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { fetchEmployeeById, currentEmployee, loading, fetchDepartments, fetchPositions, fetchEmployeeTypes, fetchLocations } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetchEmployeeById(empId);
    fetchDepartments();
    fetchPositions();
    fetchEmployeeTypes();
    fetchLocations();
  }, [empId]);

  const handleSaved = () => {
    setSaveMsg('Profile updated successfully.');
    fetchEmployeeById(empId);
    if (onSaved) onSaved();
    setTimeout(() => setSaveMsg(''), 4000);
  };

  if (loading || !currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="loading loading-spinner loading-lg text-blue-500 mb-4"></div>
        <p className={styles.textMuted}>Loading employee data...</p>
      </div>
    );
  }

  const emp = currentEmployee;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={styles.btnGhost(isDarkMode)}>
             <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
             Back
          </button>
          <div>
            <h1 className={styles.stepTitle}>Edit Employee Profile</h1>
            <p className={styles.stepSubtitle}>{emp.FirstName} {emp.LastName} • {emp.EmpCode || emp.EmpID}</p>
          </div>
        </div>
      </div>

      {saveMsg && <div className={styles.alertSuccess + " animate-bounce"}>{saveMsg}</div>}

      <div className={styles.sectionCard + " !p-0 overflow-hidden"}>
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-8 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${
                activeTab === i
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {tab}
              {activeTab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full mx-6" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 0 && <BasicTab emp={emp} onSaved={handleSaved} styles={styles} isDarkMode={isDarkMode} />}
          {activeTab === 1 && <DeptTab emp={emp} onSaved={handleSaved} styles={styles} isDarkMode={isDarkMode} />}
          {activeTab === 2 && <BankTab emp={emp} styles={styles} isDarkMode={isDarkMode} />}
          {activeTab === 3 && <AcademicTab emp={emp} styles={styles} isDarkMode={isDarkMode} />}
          {activeTab === 4 && <ExperienceTab emp={emp} styles={styles} isDarkMode={isDarkMode} />}
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
