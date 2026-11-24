import React, { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/API';
import { useAuth } from '../../../../context/AuthContext';
import DatePicker from '../../../../components/common/DatePicker';

const BasicInfo = ({ formData = {}, setFormData = () => { }, onNext, validationsEnabled }) => {
  const notify = useNotification();
  const { isDarkMode } = useThemeStore();
  const { user } = useAuth();

  const [form, setForm] = useState({
    formNo: '',
    centerCode: '',
    employeeId: '',
    generatedRegNo: '',
    fullName: '',
    dob: '',
    gender: '',
    category: '',
    aadharNo: '',
    religion: '',
    otherInfo: '',
    maritalStatus: '',
    exServiceman: '',
    isHandicapped: '',
    handicapType: '',
    handicapPercentage: '',
    visibleMark: '',
    apaarId: '',
    fathersOccupation: '',
    fathersOccupationOther: '',
    guardianType: '',
    guardianName: '',
    guardianContactNumber: '',
    guardianCategory: '',
    guardianConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centres, setCentres] = useState([]);
  const [centreDropdownOpen, setCentreDropdownOpen] = useState(false);
  const [centreSearch, setCentreSearch] = useState('');

  // Loading / error states for auto-generated fields
  const [generatingFormNo, setGeneratingFormNo] = useState(false);
  const [generatingRegNo, setGeneratingRegNo] = useState(false);
  const [genError, setGenError] = useState('');

  // Track whether the user is an admin who can override generated IDs
  const isAdmin = ['Admin', 'Super Admin', 'admin', 'super_admin'].includes(user?.role);
  const [overrideMode, setOverrideMode] = useState(false);

  /* ── Seed form from props on mount ── */
  useEffect(() => {
    const monthsList = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    setForm(prev => ({
      ...prev,
      ...formData,
      dob: formData.dob ? formData.dob.substring(0, 10) : '',
      month: formData.month || monthsList[new Date().getMonth()],
      employeeId: user?._id || formData.employeeId || '',
    }));
    fetchAllCentres();
  }, []); // only on mount — intentionally no deps

  /* ── Regenerate FormNo / RegNo when centerCode changes ── */
  useEffect(() => {
    if (!form.centerCode) return;
    const sameCenter = formData.centerCode === form.centerCode;
    fetchNextIdentifiers(
      form.centerCode,
      sameCenter && !!formData.formNo && !overrideMode,
      sameCenter && !!formData.generatedRegNo && !overrideMode
    );
  }, [form.centerCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllCentres = async () => {
    try {
      const response = await API.get('/centre-codes');
      setCentres(response?.data || []);
    } catch (error) {
      console.error('Error fetching centres:', error);
    }
  };

  const fetchNextIdentifiers = useCallback(async (centerCode, skipFormNo = false, skipRegNo = false) => {
    setGenError('');
    try {
      if (!skipFormNo) {
        setGeneratingFormNo(true);
        const res = await API.get(`/admissions/next-form-no/${centerCode}`);
        if (res?.success) {
          setForm(prev => ({ ...prev, formNo: res.nextFormNo }));
          setErrors(prev => ({ ...prev, formNo: '' }));
        }
        setGeneratingFormNo(false);
      }

      if (!skipRegNo) {
        setGeneratingRegNo(true);
        const res = await API.get(`/admissions/next-reg-no/${centerCode}`);
        if (res?.success) {
          setForm(prev => ({ ...prev, generatedRegNo: res.nextRegNo }));
          setErrors(prev => ({ ...prev, generatedRegNo: '' }));
        }
        setGeneratingRegNo(false);
      }
    } catch (error) {
      console.error('Error fetching identifiers:', error);
      setGeneratingFormNo(false);
      setGeneratingRegNo(false);
      setGenError('Could not auto-generate IDs. Please retry or enter manually.');
    }
  }, []);

  const filteredCentres = centres.filter(c =>
    c.centreCode.toLowerCase().includes(centreSearch.toLowerCase())
  );

  const handleCentreSelect = (centre) => {
    setForm(prev => ({ ...prev, centerCode: centre.centreCode }));
    setCentreSearch('');
    setCentreDropdownOpen(false);
    if (errors.centerCode) setErrors(prev => ({ ...prev, centerCode: '' }));
  };

  /* ── Age helper ── */
  const getAge = () => {
    if (!form.dob) return null;
    const dob = new Date(form.dob);
    const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
    return isNaN(age) ? null : age;
  };
  const isMinor = () => { const a = getAge(); return a !== null && a < 18; };

  /* ── Validation ── */
  const requiredFields = [
    'formNo', 'centerCode', 'employeeId', 'generatedRegNo',
    'fullName', 'dob', 'gender', 'category', 'aadharNo', 'religion',
  ];

  const validate = () => {
    if (!validationsEnabled) { setErrors({}); return true; }
    const errs = {};

    requiredFields.forEach(field => {
      if (!form[field]?.toString().trim()) errs[field] = 'This field is required';
    });

    if (form.apaarId && form.apaarId.toString().length !== 12) {
      errs.apaarId = 'APAAR ID must be exactly 12 digits';
    }

    if (isMinor()) {
      if (!form.guardianType) errs.guardianType = 'Required for under-18 student';
      if (!form.guardianName?.trim()) errs.guardianName = 'Required for under-18 student';
      if (!form.guardianContactNumber?.trim()) errs.guardianContactNumber = 'Required for under-18 student';
      if (!form.guardianConsent) errs.guardianConsent = 'Guardian consent is required';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) notify('Please fill all required fields.', 'error');
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (typeof onNext === 'function') {
        onNext(form);
        notify('Basic information saved successfully.', 'success');
      }
    } catch (err) {
      console.error('Failed to proceed:', err);
      notify('Failed to proceed to next step.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Styles ── */
  const inputStyle = (field) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
          : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelStyle = `block text-sm font-semibold mb-2 tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`;

  /* ── Spinner icon ── */
  const Spinner = () => (
    <span className="absolute inset-y-0 left-3 flex items-center gap-1.5 text-xs text-blue-500 pointer-events-none">
      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Generating…
    </span>
  );

  return (
    <div className={`rounded-2xl shadow-lg mt-8 p-8 w-full mx-auto ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
      : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'}`}>

      <h2 className={`text-2xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
        Step 1: Basic Info
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* Center Code — Searchable Dropdown */}
          <div className="relative">
            <label className={labelStyle}>
              Center Code {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={centreDropdownOpen ? centreSearch : form.centerCode}
              onChange={e => setCentreSearch(e.target.value)}
              onFocus={() => setCentreDropdownOpen(true)}
              onBlur={() => setTimeout(() => setCentreDropdownOpen(false), 200)}
              placeholder="Search and select center code"
              className={inputStyle('centerCode')}
            />
            {centreDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border rounded-lg shadow-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {filteredCentres.length > 0
                  ? filteredCentres.map((c, i) => (
                    <div key={i} className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 text-sm"
                      onMouseDown={() => handleCentreSelect(c)}>{c.centreCode}</div>
                  ))
                  : <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No center found</div>
                }
              </div>
            )}
            {errors.centerCode && <p className="text-xs text-red-400 mt-1">{errors.centerCode}</p>}
          </div>

          {/* Form No — with loading spinner + admin override */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={labelStyle} style={{ marginBottom: 0 }}>
                Form No {validationsEnabled && <span className="text-red-500">*</span>}
              </span>
              {isAdmin && (
                <button type="button" onClick={() => setOverrideMode(o => !o)}
                  className="text-xs text-blue-500 underline">
                  {overrideMode ? 'Lock' : 'Edit (Admin)'}
                </button>
              )}
            </div>
            <div className="relative">
              <input type="text" name="formNo"
                value={generatingFormNo ? '' : (form.formNo || '')}
                readOnly={!overrideMode}
                onChange={overrideMode ? handleChange : undefined}
                placeholder={!form.centerCode ? 'Please select Center Code first' : generatingFormNo ? '' : 'Auto-generated'}
                className={`${inputStyle('formNo')} ${!overrideMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                autoComplete="off"
              />
              {generatingFormNo && <Spinner />}
            </div>
            {errors.formNo && <p className="text-xs text-red-400 mt-1">{errors.formNo}</p>}
          </div>

          {/* Employee ID — always read-only */}
          <div>
            <label className={labelStyle}>
              Employee ID {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input type="text" name="employeeId" value={form.employeeId || ''}
              readOnly disabled
              className={`${inputStyle('employeeId')} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
            />
            {errors.employeeId && <p className="text-xs text-red-400 mt-1">{errors.employeeId}</p>}
          </div>

          {/* Generated Reg No — with loading spinner + admin override */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={labelStyle} style={{ marginBottom: 0 }}>
                Generated Reg No {validationsEnabled && <span className="text-red-500">*</span>}
              </span>
              {isAdmin && overrideMode && (
                <span className="text-xs text-amber-500 font-semibold">Admin override active</span>
              )}
            </div>
            <div className="relative">
              <input type="text" name="generatedRegNo"
                value={generatingRegNo ? '' : (form.generatedRegNo || '')}
                readOnly={!overrideMode}
                onChange={overrideMode ? handleChange : undefined}
                placeholder={!form.centerCode ? 'Please select Center Code first' : generatingRegNo ? '' : 'Auto-generated'}
                className={`${inputStyle('generatedRegNo')} ${!overrideMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                autoComplete="off"
              />
              {generatingRegNo && <Spinner />}
            </div>
            {errors.generatedRegNo && <p className="text-xs text-red-400 mt-1">{errors.generatedRegNo}</p>}
          </div>

          {/* Error + retry if generation failed */}
          {genError && (
            <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
              <span className="text-xs text-red-600 dark:text-red-400">{genError}</span>
              <button type="button" onClick={() => fetchNextIdentifiers(form.centerCode)}
                className="text-xs font-bold text-blue-600 underline">Retry</button>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className={labelStyle}>
              Full Name {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input type="text" name="fullName" value={form.fullName || ''}
              onChange={e => handleChange({ target: { name: 'fullName', value: e.target.value.toUpperCase() } })}
              className={inputStyle('fullName')} autoComplete="off"
            />
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* Aadhar No */}
          <div>
            <label className={labelStyle}>
              Aadhar No {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input type="text" name="aadharNo" maxLength={12}
              value={form.aadharNo || ''}
              onChange={handleChange}
              className={inputStyle('aadharNo')} autoComplete="off"
            />
            {errors.aadharNo && <p className="text-xs text-red-400 mt-1">{errors.aadharNo}</p>}
          </div>

          {/* Religion */}
          <div>
            <label className={labelStyle}>
              Religion {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <select name="religion" value={form.religion || ''} onChange={handleChange} className={inputStyle('religion')}>
              <option value="">Select religion</option>
              {['Hindu','Muslim','Christian','Sikh','Buddhist','Jain','Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.religion && <p className="text-xs text-red-400 mt-1">{errors.religion}</p>}
          </div>

          {/* DOB */}
          <div>
            <label className={labelStyle}>
              Date of Birth {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <DatePicker value={form.dob || ''} onChange={handleChange}
              placeholder="dd-mm-yyyy" className={inputStyle('dob')} isDarkMode={isDarkMode}
            />
            {form.dob && (() => {
              const a = getAge();
              if (a === null) return null;
              return (
                <p className={`text-xs mt-1 ${a < 18 ? 'text-amber-500 font-semibold' : 'text-gray-400'}`}>
                  Age: {a} year{a !== 1 ? 's' : ''}{a < 18 ? ' — Minor (guardian details required below)' : ''}
                </p>
              );
            })()}
            {errors.dob && <p className="text-xs text-red-400 mt-1">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className={labelStyle}>
              Gender {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputStyle('gender')}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-red-400 mt-1">{errors.gender}</p>}
          </div>

          {/* Category — EWS added (B.1) */}
          <div>
            <label className={labelStyle}>
              Category {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <select name="category" value={form.category || ''} onChange={handleChange} className={inputStyle('category')}>
              <option value="">Select category</option>
              <option value="GEN">General (GEN)</option>
              <option value="OBC">Other Backward Class (OBC)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
          </div>

          {/* Marital Status (B.1) */}
          <div>
            <label className={labelStyle}>Marital Status</label>
            <select name="maritalStatus" value={form.maritalStatus || ''} onChange={handleChange} className={inputStyle('maritalStatus')}>
              <option value="">Select marital status</option>
              {['Single','Married','Divorced','Widowed','Other'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Ex-Serviceman (B.1) */}
          <div>
            <label className={labelStyle}>Ex-Serviceman</label>
            <div className="flex gap-4 mt-2">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="exServiceman" value={opt}
                    checked={form.exServiceman === opt} onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Person with Disability (B.1) */}
          <div>
            <label className={labelStyle}>Person with Disability (PwD)</label>
            <div className="flex gap-4 mt-2">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="isHandicapped" value={opt}
                    checked={form.isHandicapped === opt} onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* PwD sub-fields (conditional) */}
          {form.isHandicapped === 'Yes' && (<>
            <div>
              <label className={labelStyle}>Disability Type</label>
              <input type="text" name="handicapType" value={form.handicapType || ''}
                onChange={e => handleChange({ target: { name: 'handicapType', value: e.target.value.toUpperCase() } })}
                placeholder="e.g. Visual, Hearing, Locomotor"
                className={inputStyle('handicapType')}
              />
            </div>
            <div>
              <label className={labelStyle}>Disability Percentage (%)</label>
              <input type="number" name="handicapPercentage" min={1} max={100}
                value={form.handicapPercentage || ''}
                onChange={handleChange}
                className={inputStyle('handicapPercentage')}
              />
            </div>
          </>)}

          {/* Visible Distinguishing Mark (B.1) */}
          <div>
            <label className={labelStyle}>Visible Distinguishing Mark <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
            <input type="text" name="visibleMark" value={form.visibleMark || ''}
              onChange={e => handleChange({ target: { name: 'visibleMark', value: e.target.value.toUpperCase() } })}
              placeholder="Optional"
              className={inputStyle('visibleMark')} autoComplete="off"
            />
          </div>

          {/* APAAR ID (B.1) */}
          <div>
            <label className={labelStyle}>APAAR ID <span className="text-xs font-normal text-gray-400">(Optional — 12 digits)</span></label>
            <input type="text" name="apaarId" maxLength={12}
              value={form.apaarId || ''}
              onChange={e => handleChange({ target: { name: 'apaarId', value: e.target.value.replace(/\D/g, '') } })}
              placeholder="123456789012"
              className={inputStyle('apaarId')} autoComplete="off"
            />
            {form.apaarId && form.apaarId.length > 0 && form.apaarId.length !== 12 && (
              <p className="text-xs text-amber-500 mt-1">Must be exactly 12 digits</p>
            )}
            {errors.apaarId && <p className="text-xs text-red-400 mt-1">{errors.apaarId}</p>}
          </div>

          {/* Father's Occupation (B.1) */}
          <div>
            <label className={labelStyle}>Father's Occupation</label>
            <select name="fathersOccupation" value={form.fathersOccupation || ''} onChange={handleChange}
              className={inputStyle('fathersOccupation')}>
              <option value="">Select occupation</option>
              <option value="Private">Private (Service)</option>
              <option value="Government">Government (Service)</option>
              <option value="Business">Business / Self-Employed</option>
              <option value="Agriculture">Agriculture / Farming</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Father's Occupation — Other text (conditional) */}
          {form.fathersOccupation === 'Other' && (
            <div>
              <label className={labelStyle}>Father's Occupation (specify)</label>
              <input type="text" name="fathersOccupationOther" value={form.fathersOccupationOther || ''}
                onChange={e => handleChange({ target: { name: 'fathersOccupationOther', value: e.target.value.toUpperCase() } })}
                className={inputStyle('fathersOccupationOther')} autoComplete="off"
              />
            </div>
          )}

          {/* Other Info */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Other Info</label>
            <textarea name="otherInfo" value={form.otherInfo || ''} onChange={handleChange}
              placeholder="Optional notes" rows={3}
              className={`${inputStyle('otherInfo')} resize-none`}
            />
          </div>
        </div>

        {/* Minor student guardian section (B — under 18) */}
        {isMinor() && (
          <div className={`rounded-xl p-6 border-2 ${isDarkMode ? 'bg-amber-900/20 border-amber-600' : 'bg-amber-50 border-amber-400'}`}>
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-4">
              ⚠ Student is under 18 — Parent / Guardian Details &amp; Consent (Required)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Guardian Type <span className="text-red-500">*</span></label>
                <select name="guardianType" value={form.guardianType || ''} onChange={handleChange}
                  className={inputStyle('guardianType')}>
                  <option value="">Select</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
                {errors.guardianType && <p className="text-xs text-red-400 mt-1">{errors.guardianType}</p>}
              </div>
              <div>
                <label className={labelStyle}>Guardian Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="guardianName" value={form.guardianName || ''}
                  onChange={e => handleChange({ target: { name: 'guardianName', value: e.target.value.toUpperCase() } })}
                  className={inputStyle('guardianName')}
                />
                {errors.guardianName && <p className="text-xs text-red-400 mt-1">{errors.guardianName}</p>}
              </div>
              <div>
                <label className={labelStyle}>Guardian Contact <span className="text-red-500">*</span></label>
                <input type="text" name="guardianContactNumber" maxLength={10}
                  value={form.guardianContactNumber || ''}
                  onChange={handleChange}
                  className={inputStyle('guardianContactNumber')}
                />
                {errors.guardianContactNumber && <p className="text-xs text-red-400 mt-1">{errors.guardianContactNumber}</p>}
              </div>
              <div>
                <label className={labelStyle}>Guardian Category</label>
                <select name="guardianCategory" value={form.guardianCategory || ''} onChange={handleChange}
                  className={inputStyle('guardianCategory')}>
                  <option value="">Select</option>
                  {['GEN','OBC','SC','ST','EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-start gap-3 md:col-span-2 mt-2">
                <input type="checkbox" id="guardianConsent" name="guardianConsent"
                  checked={!!form.guardianConsent}
                  onChange={e => handleChange({ target: { name: 'guardianConsent', value: e.target.checked } })}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded"
                />
                <label htmlFor="guardianConsent" className="text-sm font-semibold cursor-pointer">
                  I, the parent/guardian, give consent for this student's admission <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.guardianConsent && <p className="text-xs text-red-400 md:col-span-3">{errors.guardianConsent}</p>}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
          <button type="submit" disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfo;
