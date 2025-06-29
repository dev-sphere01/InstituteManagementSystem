import React from 'react';

const ComputerAccess = ({ formData = {}, setFormData = () => {} }) => {
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
      [name]: value,
    }));
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Computer Access</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Computer Access Dropdown */}
        <div>
          <label className="block mb-1">Where do you access a computer?</label>
          <select
            name="computerAccess"
            value={formData.computerAccess || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select an option</option>
            {accessOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* If "Other" is selected */}
        {formData.computerAccess === 'Other' && (
          <div>
            <label className="block mb-1">Other (please specify)</label>
            <input
              type="text"
              name="computerAccessOther"
              value={formData.computerAccessOther || ''}
              onChange={handleChange}
              placeholder="Specify access location"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputerAccess;
