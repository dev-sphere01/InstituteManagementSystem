import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const Education = ({ formId,formData = {}, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    if (!validationsEnabled) {
      setErrors({});
      return true;
    }

    const requiredFields = [
      'highestEducationalQualification',
      'boardOrUniversity',
      'yearOfPassing',
      'subjectsStudied',
      'courseApplied',
      'preferredModeOfLearning',
    ];

    const errs = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) errs[field] = 'Required';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (validationsEnabled && !validate()) return;
  
    setLoading(true);
    try {
      const subjectsArray = formData.subjectsStudied
        ? Array.isArray(formData.subjectsStudied)
          ? formData.subjectsStudied
          : formData.subjectsStudied
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
  
      const payload = {
        ...formData,
        subjectsStudied: subjectsArray,
      };
  
      if (typeof onNext === 'function') {
        await onNext(payload);
        notify('Education details saved successfully.', 'success');
      }
    } catch (error) {
      console.error('Failed to save education step:', error);
      notify('Failed to save education details.', 'error');
    } finally {
      setLoading(false);
    }
  };
  

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[field]
      ? 'border-red-500 focus:ring-red-400'
      : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  const renderInput = ({
    label,
    name,
    type = 'text',
    isSelect = false,
    options = [],
    placeholder = '',
    required = false,
  }) => {
    const value =
      name === 'subjectsStudied' && Array.isArray(formData[name])
        ? formData[name].join(', ')
        : formData[name] || '';

    return (
      <div>
        <label className={labelClass}>
          {label} {required && validationsEnabled && <span className="text-red-500">*</span>}
        </label>
        {isSelect ? (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className={inputClass(name)}
          >
            <option value="">Select Mode</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className={inputClass(name)}
            placeholder={placeholder}
          />
        )}
        {errors[name] && <p className="text-xs text-red-400 mt-1 font-medium">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <div
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
        : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
        }`}
    >
      <h2
        className={`text-2xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'
          }`}
      >
        Step 3: Education & Course Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderInput({
          label: 'Highest Educational Qualification',
          name: 'highestEducationalQualification',
          required: true,
          placeholder: "e.g. Bachelor's in Science",
        })}
        {renderInput({
          label: 'Board/University',
          name: 'boardOrUniversity',
          required: true,
          placeholder: 'e.g. CBSE, Delhi University',
        })}
        {renderInput({
          label: 'Year of Passing',
          name: 'yearOfPassing',
          required: true,
          placeholder: 'e.g. 2023',
          type: 'number',
        })}
        {renderInput({
          label: 'Subjects Studied',
          name: 'subjectsStudied',
          required: true,
          placeholder: 'e.g. Physics, Chemistry, Math',
        })}
        {renderInput({
          label: 'Course Applied',
          name: 'courseApplied',
          required: true,
          placeholder: 'e.g. Diploma in Computer Applications',
        })}
        {renderInput({
          label: 'Preferred Mode of Learning',
          name: 'preferredModeOfLearning',
          required: true,
          isSelect: true,
          options: ['online', 'offline', 'hybrid'],
        })}
      </div>

      <div className="flex items-center justify-between pt-8 border-t mt-8 border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode
            ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
            : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
            }`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }`}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Education;
