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
        ...prev.referral,
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
      className={`w-full rounded-xl shadow-md p-6 ${
        isDarkMode
          ? 'bg-gray-800 border border-gray-700 text-white'
          : 'bg-white border border-gray-200 text-gray-900'
      }`}
    >
      <h3 className="text-xl font-bold mb-6">Referral Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Referral Source */}
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

        {/* Other Source (if selected) */}
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

        {/* Name of Referrer */}
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
