import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import API from '../../../../services/api';

const BasicInfoForm = ({ formId, onNext, onCancel, loading: parentLoading, validationsEnabled }) => {
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

  const validate = () => {
    if (!validationsEnabled) {
      setErrors({});
      return true;
    }

    const requiredFields = [
      'formNo',
      'centerCode',
      'employeeId',
      'generatedRegNo',
      'fullName',
      'dob',
      'gender',
      'category',
      'aadharNo',
      'religion',
    ];

    const errs = {};
    requiredFields.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = 'This field is required';
    });

    setErrors(errs);
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
      const payload = {
        ...form,
        currentStep: 'basic',
        isCompleted: false,
      };

      let response;
      if (formId) {
        response = await API.put(`/admissions/${formId}`, payload);
      } else {
        response = await API.post('/admissions', payload);
      }

      if (typeof onNext === 'function') {
        onNext(response); // return whole saved response (contains _id)
      }
    } catch (err) {
      console.error('Error saving basic info:', err);
      alert('Failed to save basic info.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-700 bg-[#23272f] text-white placeholder-gray-400 focus:bg-[#23272f]'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white'
    }`;

  const labelStyle = `block text-sm font-semibold mb-2 tracking-wide ${
    isDarkMode ? 'text-gray-200' : 'text-gray-800'
  }`;

  return (
    <div
      className={`rounded-2xl shadow-lg ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
      } p-8 w-full mx-auto mt-8`}
    >
      <h2 className={`text-2xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
        Step 1: Basic Info
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[ 
            { name: 'formNo', label: 'Form No' },
            { name: 'centerCode', label: 'Center Code' },
            { name: 'employeeId', label: 'Employee ID' },
            { name: 'generatedRegNo', label: 'Generated Reg No' },
            { name: 'fullName', label: 'Full Name' },
            { name: 'aadharNo', label: 'Aadhar No' },
            { name: 'dob', label: 'Date of Birth', type: 'date' },
          ].map(({ name, label, type = 'text' }) => (
            <div key={name}>
              <label className={labelStyle} htmlFor={name}>
                {label} {validationsEnabled && <span className="text-red-500">*</span>}
              </label>
              <input
                id={name}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                disabled={isSubmitting || parentLoading}
                className={inputStyle(name)}
                placeholder={label}
                autoComplete="off"
              />
              {errors[name] && <p className="text-xs text-red-400 mt-1 font-medium">{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className={labelStyle} htmlFor="gender">
              Gender {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={isSubmitting || parentLoading}
              className={inputStyle('gender')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-red-400 mt-1 font-medium">{errors.gender}</p>}
          </div>

          <div>
            <label className={labelStyle} htmlFor="category">
              Category {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              id="category"
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="General / OBC / SC / ST"
              disabled={isSubmitting || parentLoading}
              className={inputStyle('category')}
              autoComplete="off"
            />
            {errors.category && <p className="text-xs text-red-400 mt-1 font-medium">{errors.category}</p>}
          </div>

          <div className="md:col-span-2">
            <label className={labelStyle} htmlFor="otherInfo">
              Other Info
            </label>
            <textarea
              id="otherInfo"
              name="otherInfo"
              value={form.otherInfo}
              onChange={handleChange}
              placeholder="Optional notes"
              rows={3}
              disabled={isSubmitting || parentLoading}
              className={`${inputStyle('otherInfo')} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
                : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
            }`}
            disabled={isSubmitting || parentLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || parentLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            {isSubmitting || parentLoading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
