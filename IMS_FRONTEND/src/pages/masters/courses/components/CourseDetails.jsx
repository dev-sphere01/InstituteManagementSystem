import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../../store';

const CourseDetails = ({ courseId, onBack, onEdit }) => {
  const { isDarkMode } = useThemeStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCourse(data.data);
        } else {
          setError('Failed to fetch course details');
        }
      })
      .catch(() => setError('Failed to fetch course details'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading course details...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <div className={`rounded-md p-4 ${isDarkMode ? 'bg-red-900/50 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Error loading course details</h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                <p>{error || 'Course not found'}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onBack}
                  className={`text-sm font-medium ${isDarkMode ? 'text-red-200 hover:text-red-100' : 'text-red-800 hover:text-red-700'} underline`}
                >
                  Back to Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Details</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`inline-flex items-center px-4 py-2 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(courseId, course)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Course
            </button>
          )}
        </div>
      </div>
      {/* Course Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Code</dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.code}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.name}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Description</dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.description}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.duration}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Level</dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.level}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</dt>
              <dd className="text-sm">
                {course.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Inactive</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
