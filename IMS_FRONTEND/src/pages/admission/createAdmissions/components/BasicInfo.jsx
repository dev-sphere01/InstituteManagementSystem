import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/API';

const BasicInfo = ({ formData = {}, setFormData = () => { }, onNext, validationsEnabled }) => {
  const notify = useNotification();
  const { isDarkMode } = useThemeStore();

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
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centres, setCentres] = useState([]);
  const [centreDropdownOpen, setCentreDropdownOpen] = useState(false);
  const [centreSearch, setCentreSearch] = useState('');


  // ✅ Single useEffect to hydrate and format DOB
  useEffect(() => {
    const formattedDob = formData.dob ? formData.dob.substring(0, 10) : '';
    setForm({
      ...formData,
      dob: formattedDob,
    });
  }, [formData]);

  const fetchAllCentres = async () => {
    try {
      const response = await API.get('/centre-codes');
      setCentres(response?.data || []);
    } catch (error) {
      console.error('Error fetching centres:', error);
    }
  };

  useEffect(() => {
    fetchAllCentres();
    console.log(centres);
  }, []);

  const filteredCentres = centres.filter(c =>
    c.centreCode.toLowerCase().includes(centreSearch.toLowerCase())
  );

  const handleCentreSelect = (centre) => {
    setForm(prev => ({ ...prev, centerCode: centre.centreCode }));
    setCentreSearch('');
    setCentreDropdownOpen(false);
    if (errors.centerCode) {
      setErrors(prev => ({ ...prev, centerCode: '' }));
    }
  };


  const requiredFields = [
    'formNo', 'centerCode', 'employeeId', 'generatedRegNo',
    'fullName', 'dob', 'gender', 'category', 'aadharNo', 'religion',
  ];

  const validate = () => {
    if (!validationsEnabled) {
      setErrors({});
      return true;
    }

    const errs = {};
    requiredFields.forEach((field) => {
      if (!form[field]?.toString().trim()) errs[field] = 'This field is required';
    });

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please fill all required fields.', 'error');
    }
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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

  const inputStyle = (field) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[field]
      ? 'border-red-500 focus:ring-red-400'
      : isDarkMode
        ? 'border-gray-700 bg-[#23272f] text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelStyle = `block text-sm font-semibold mb-2 tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
    }`;

  return (
    <div
      className={`rounded-2xl shadow-lg mt-8 p-8 w-full mx-auto ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
        : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
        }`}
    >
      <h2 className={`text-2xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
        Step 1: Basic Info
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Form No */}
          <div>
            <label className={labelStyle}>
              Form No {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="formNo"
              value={form.formNo || ''}
              onChange={handleChange}
              className={inputStyle('formNo')}
              autoComplete="off"
            />
            {errors.formNo && <p className="text-xs text-red-400 mt-1">{errors.formNo}</p>}
          </div>

          {/* Center Code - Searchable Dropdown */}
          <div className="relative">
            <label className={labelStyle}>
              Center Code {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={centreDropdownOpen ? centreSearch : form.centerCode}
              onChange={(e) => setCentreSearch(e.target.value)}
              onFocus={() => setCentreDropdownOpen(true)}
              onBlur={() => setTimeout(() => setCentreDropdownOpen(false), 200)}
              placeholder="Search and select center code"
              className={inputStyle('centerCode')}
            />
            {centreDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border rounded-lg shadow-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {filteredCentres.length > 0 ? (
                  filteredCentres.map((centre, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 text-sm"
                      onClick={() => handleCentreSelect(centre)}
                    >
                      {centre.centreCode}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No center found</div>
                )}
              </div>
            )}
            {errors.centerCode && <p className="text-xs text-red-400 mt-1">{errors.centerCode}</p>}
          </div>

          {/* Employee ID */}
          <div>
            <label className={labelStyle}>
              Employee ID {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="employeeId"
              value={form.employeeId || ''}
              onChange={handleChange}
              className={inputStyle('employeeId')}
              autoComplete="off"
            />
            {errors.employeeId && <p className="text-xs text-red-400 mt-1">{errors.employeeId}</p>}
          </div>

          {/* Generated Reg No */}
          <div>
            <label className={labelStyle}>
              Generated Reg No {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="generatedRegNo"
              value={form.generatedRegNo || ''}
              onChange={handleChange}
              className={inputStyle('generatedRegNo')}
              autoComplete="off"
            />
            {errors.generatedRegNo && <p className="text-xs text-red-400 mt-1">{errors.generatedRegNo}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className={labelStyle}>
              Full Name {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName || ''}
              onChange={handleChange}
              className={inputStyle('fullName')}
              autoComplete="off"
            />
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* Aadhar No */}
          <div>
            <label className={labelStyle}>
              Aadhar No {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="aadharNo"
              value={form.aadharNo || ''}
              onChange={handleChange}
              className={inputStyle('aadharNo')}
              autoComplete="off"
            />
            {errors.aadharNo && <p className="text-xs text-red-400 mt-1">{errors.aadharNo}</p>}
          </div>

          {/* Religion */}
          <div>
            <label className={labelStyle}>
              Religion {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="religion"
              value={form.religion || ''}
              onChange={handleChange}
              className={inputStyle('religion')}
              autoComplete="off"
            />
            {errors.religion && <p className="text-xs text-red-400 mt-1">{errors.religion}</p>}
          </div>

          {/* DOB */}
          <div>
            <label className={labelStyle}>
              Date of Birth {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob || ''}
              onChange={handleChange}
              className={inputStyle('dob')}
              autoComplete="off"
            />
            {errors.dob && <p className="text-xs text-red-400 mt-1">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className={labelStyle}>
              Gender {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputStyle('gender')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-red-400 mt-1">{errors.gender}</p>}
          </div>

          {/* Category */}
          <div>
            <label className={labelStyle}>
              Category {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="General / OBC / SC / ST"
              className={inputStyle('category')}
            />
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
          </div>

          {/* Other Info */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Other Info</label>
            <textarea
              name="otherInfo"
              value={form.otherInfo || ''}
              onChange={handleChange}
              placeholder="Optional notes"
              rows={3}
              className={`${inputStyle('otherInfo')} resize-none`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting
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
