import React from 'react';

const Referral = ({ formData = {}, setFormData = () => {} }) => {
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
      [name]: value,
    }));
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Referral Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Referral Source */}
        <div>
          <label className="block mb-1">How did you hear about us?</label>
          <select
            name="referralSource"
            value={formData.referralSource || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a source</option>
            {referralSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Referral Source Other */}
        {formData.referralSource === 'Other' && (
          <div>
            <label className="block mb-1">Other (please specify)</label>
            <input
              type="text"
              name="referralSourceOther"
              value={formData.referralSourceOther || ''}
              onChange={handleChange}
              placeholder="Specify other source"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}

        {/* Referral Name */}
        <div className="md:col-span-2">
          <label className="block mb-1">Referred by (Name)</label>
          <input
            type="text"
            name="referalName"
            value={formData.referalName || ''}
            onChange={handleChange}
            placeholder="Enter name of the person"
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Referral;
