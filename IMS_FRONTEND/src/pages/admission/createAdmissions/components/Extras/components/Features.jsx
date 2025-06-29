import React from 'react';
import { useThemeStore } from '../../../../../../store';


const Features = ({ formData = {}, setFormData = () => {} }) => {
  const { isDarkMode } = useThemeStore();

  const featureList = [
    { key: 'tShirt', label: 'T-Shirt' },
    { key: 'itTools', label: 'IT Tools' },
    { key: 'webDesigning', label: 'Web Designing' },
    { key: 'tally', label: 'Tally' },
    { key: 'gfxDtp', label: 'Graphics/DTP' },
    { key: 'python', label: 'Python' },
    { key: 'iot', label: 'IoT' },
  ];

  const handleCheckboxChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  return (
    <div
      className={`w-full rounded-2xl shadow-md p-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 text-white'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 text-gray-900'
      }`}
    >
      <h3 className="text-xl font-bold mb-6">Additional Features</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featureList.map(({ key, label }) => (
          <label
            key={key}
            className={`flex items-center gap-3 text-sm font-medium ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            <input
              type="checkbox"
              checked={!!formData[key]}
              onChange={() => handleCheckboxChange(key)}
              className={`w-4 h-4 rounded border focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-blue-400 focus:ring-offset-gray-900'
                  : 'bg-white border-gray-300 text-blue-600 focus:ring-offset-white'
              }`}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Features;
