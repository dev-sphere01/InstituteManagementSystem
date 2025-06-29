import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';

const BasicInfoForm = ({ onNext, onCancel, loading: parentLoading }) => {
  const { isDarkMode } = useThemeStore();

  const [form, setForm] = useState({
    formNo: '',
    centerCode: '',
    employeeId: '',
    otherInfo: '',
    generatedRegNo: '',
    fullName: '',
    dob: '',
    gender: '',
    category: '',
    aadharNo: '',
    religion: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const requiredFields = ['formNo', 'centerCode', 'employeeId', 'generatedRegNo', 'fullName', 'dob', 'gender', 'category', 'aadharNo', 'religion'];
    const errs = {};
    requiredFields.forEach(field => {
      if (!form[field]?.trim()) errs[field] = 'This field is required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      if (typeof onNext === 'function') onNext(form);
      setIsSubmitting(false);
    }, 300);
  };

  const inputStyle = (field) =>
    `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-white text-gray-900'
    }`;

  const labelStyle = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-w-4xl mx-auto`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Step 1: Basic Info
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className={labelStyle}>
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                disabled={isSubmitting || parentLoading}
                className={inputStyle(name)}
              />
              {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className={labelStyle}>
              Gender <span className="text-red-500">*</span>
            </label>
            <select
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
            {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className={labelStyle}>
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="General / OBC / SC / ST"
              disabled={isSubmitting || parentLoading}
              className={inputStyle('category')}
            />
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className={labelStyle}>
              Religion <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="religion"
              value={form.religion}
              onChange={handleChange}
              placeholder="e.g. Hindu / Muslim / Christian"
              disabled={isSubmitting || parentLoading}
              className={inputStyle('religion')}
            />
            {errors.religion && <p className="text-sm text-red-500 mt-1">{errors.religion}</p>}
          </div>

          <div className="md:col-span-2">
            <label className={labelStyle}>Other Info</label>
            <textarea
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

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
            disabled={isSubmitting || parentLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || parentLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
