import React from 'react';
import { useThemeStore } from '../../../../../../store';

const Referral = ({ formData = {}, setFormData = () => {}, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const referral = formData.referral || {};

  const referralSources = [
    'Social Media',
    'Friend/Relative',
    'Advertisement',
    'School/College',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      referral: {
        ...(prev.referral || {}),
        [name]: value,
      },
    }));
  };

  const inputClass = `w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  return (
    <div
      className={`w-full rounded-2xl shadow-md p-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 text-white'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 text-gray-900'
      }`}
    >
      <h3 className="text-xl font-bold mb-6">Referral Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>How did you hear about us?</label>
          <select
            name="referralSource"
            value={referral.referralSource || ''}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a source</option>
            {referralSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {referral.referralSource === 'Other' && (
          <div>
            <label className={labelClass}>Other (please specify)</label>
            <input
              type="text"
              name="referralSourceOther"
              value={referral.referralSourceOther || ''}
              onChange={handleChange}
              className={inputClass}
              placeholder="Specify other source"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className={labelClass}>Referred by (Name)</label>
          <input
            type="text"
            name="referalName"
            value={referral.referalName || ''}
            onChange={handleChange}
            placeholder="Enter name of the person"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};

export default Referral;
