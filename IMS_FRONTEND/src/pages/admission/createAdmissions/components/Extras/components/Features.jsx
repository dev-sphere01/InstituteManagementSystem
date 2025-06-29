import React from 'react';

const Features = ({ formData = {}, setFormData = () => {} }) => {
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
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Additional Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureList.map(({ key, label }) => (
          <label key={key} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={!!formData[key]} // Safe access
              onChange={() => handleCheckboxChange(key)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Features;
