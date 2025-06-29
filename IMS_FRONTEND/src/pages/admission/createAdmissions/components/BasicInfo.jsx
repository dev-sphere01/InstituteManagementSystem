import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';

const BasicInfo = ({ formData = {}, setFormData = () => {}, onNext, validationsEnabled }) => {
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

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

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
      if (!form[field]?.trim()) errs[field] = 'This field is required';
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
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-700 bg-[#23272f] text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelStyle = `block text-sm font-semibold mb-2 tracking-wide ${
    isDarkMode ? 'text-gray-200' : 'text-gray-800'
  }`;

  return (
    <div
      className={`rounded-2xl shadow-lg mt-8 p-8 w-full mx-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
      }`}
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
            { name: 'religion', label: 'Religion' },
            { name: 'dob', label: 'Date of Birth', type: 'date' },
          ].map(({ name, label, type = 'text' }) => (
            <div key={name}>
              <label className={labelStyle}>
                {label} {validationsEnabled && <span className="text-red-500">*</span>}
              </label>
              <input
                type={type}
                name={name}
                value={form[name] || ''}
                onChange={handleChange}
                className={inputStyle(name)}
                autoComplete="off"
              />
              {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]}</p>}
            </div>
          ))}

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
