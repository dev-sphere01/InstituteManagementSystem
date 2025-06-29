import React from 'react';
import { useThemeStore } from '../../../../store';

const Education = ({ formData=[], setFormData }) => {
  const { isDarkMode } = useThemeStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  return (
    <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full max-w-4xl mx-auto`}>
      <h2 className="text-2xl font-semibold mb-6">Education & Course Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Highest Educational Qualification <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="highestEducationalQualification"
            value={formData.highestEducationalQualification || ''}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g. Bachelor's in Science"
          />
        </div>

        <div>
          <label className={labelClasses}>Board/University <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="boardOrUniversity"
            value={formData.boardOrUniversity || ''}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g. CBSE, Delhi University"
          />
        </div>

        <div>
          <label className={labelClasses}>Year of Passing <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="yearOfPassing"
            value={formData.yearOfPassing || ''}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g. 2023"
          />
        </div>

        <div>
          <label className={labelClasses}>Subjects Studied <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="subjectsStudied"
            value={formData.subjectsStudied || ''}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g. Physics, Chemistry, Math"
          />
        </div>

        <div>
          <label className={labelClasses}>Course Applied <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="courseApplied"
            value={formData.courseApplied || ''}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g. Diploma in Computer Applications"
          />
        </div>

        <div>
          <label className={labelClasses}>Preferred Mode of Learning <span className="text-red-500">*</span></label>
          <select
            name="preferredModeOfLearning"
            value={formData.preferredModeOfLearning || ''}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="" disabled>Select Mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Education;
