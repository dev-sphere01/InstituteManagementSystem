import React from 'react';
import { useThemeStore } from '../../../../../../store';

const ComputerAccess = ({ formData = {}, setFormData = () => {}, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const computerAccess = formData?.computerAccess || {};

  const accessOptions = [
    'Home',
    'Cyber Cafe',
    'Institute Provided',
    'No Access',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      computerAccess: {
        ...(prev.computerAccess || {}),
        [name]: value,
      },
    }));
  };

  const inputClass = `w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-semibold mb-1 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  return (
    <div
      className={`w-full rounded-xl shadow-md p-6 mb-6 ${
        isDarkMode
          ? 'bg-gray-800 border border-gray-700 text-white'
          : 'bg-white border border-gray-200 text-gray-900'
      }`}
    >
      <h3 className="text-xl font-bold mb-6">Computer Access</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Where do you access a computer?</label>
          <select
            name="location"
            value={computerAccess.location || ''}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select an option</option>
            {accessOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {computerAccess.location === 'Other' && (
          <div>
            <label className={labelClass}>Other (please specify)</label>
            <input
              type="text"
              name="otherLocation"
              value={computerAccess.otherLocation || ''}
              onChange={handleChange}
              placeholder="Specify access location"
              className={inputClass}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputerAccess;
