import React, { useState, useCallback } from 'react'
import AddCourse from './components/AddCourse'
import AllCourses from './components/AllCourses'
import EditCourse from './components/EditCourse'
import CourseDetails from './components/CourseDetails'
import { useThemeStore } from '../../../store'

const Courses = () => {
  const { isDarkMode } = useThemeStore();
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit', 'view'
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [editCourse, setEditCourse] = useState(null);

  // Fetch courses from backend
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (data.success) {
        setCourses(data.data)
      } else {
        setError('Failed to fetch courses')
      }
    } catch (err) {
      setError('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Handlers for view changes
  const handleViewChange = (view, courseId = null, courseObj = null) => {
    setCurrentView(view);
    setSelectedCourseId(courseId);
    setEditCourse(courseObj);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourseId(null);
    setEditCourse(null);
    fetchCourses();
  };

  // Add course
  const handleAddCourse = async (course) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.success) {
        handleBackToList();
      } else {
        setError(data.message || 'Failed to add course')
      }
    } catch (err) {
      setError('Failed to add course')
    } finally {
      setLoading(false)
    }
  }

  // Update course
  const handleUpdateCourse = async (course) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/courses/${course._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.success) {
        handleBackToList();
      } else {
        setError(data.message || 'Failed to update course')
      }
    } catch (err) {
      setError('Failed to update course')
    } finally {
      setLoading(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        fetchCourses();
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      setError('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'add':
        return (
          <AddCourse onCourseCreated={handleAddCourse} onCancel={handleBackToList} loading={loading} />
        );
      case 'edit':
        return (
          <EditCourse course={editCourse} onCourseUpdated={handleUpdateCourse} onCancel={handleBackToList} loading={loading} />
        );
      case 'view':
        return (
          <CourseDetails courseId={selectedCourseId} onBack={handleBackToList} />
        );
      default:
        return (
          <AllCourses
            courses={courses}
            onEditCourse={(course) => handleViewChange('edit', course._id, course)}
            onDeleteCourse={handleDeleteCourse}
            onViewCourse={(course) => handleViewChange('view', course._id, course)}
            onAddCourse={() => handleViewChange('add')}
            loading={loading}
            error={error}
          />
        );
    }
  };

  // Breadcrumb label
  const getBreadcrumbLabel = () => {
    switch (currentView) {
      case 'add':
        return 'Add Course';
      case 'edit':
        return 'Edit Course';
      case 'view':
        return 'Course Details';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Course Master
            </span>
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage all courses, levels, and details</p>
        </div>
        {/* Breadcrumb */}
        {currentView !== 'list' && (
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={handleBackToList}
                  className={`text-sm font-medium ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                >
                  Courses
                </button>
              </li>
              <li>
                <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {getBreadcrumbLabel()}
                </span>
              </li>
            </ol>
          </nav>
        )}
      </div>
      {/* Content */}
      <div className={`rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Courses;