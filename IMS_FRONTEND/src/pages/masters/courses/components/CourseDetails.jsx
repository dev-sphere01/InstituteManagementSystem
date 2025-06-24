import React from 'react';
import { useThemeStore } from '../../../../store';

const CourseDetails = ({ courseId, onBack }) => {
  const { isDarkMode } = useThemeStore();
  // Fetch course details by courseId
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Details</h2>
        </div>
        <button
          onClick={onBack}
          className={`inline-flex items-center px-4 py-2 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          Back to Courses
        </button>
      </div>
      {/* Course details go here */}
      <div>{/* ... */}</div>
    </div>
  );
};

export default CourseDetails;
