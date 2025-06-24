import React, { useState, useCallback } from 'react'
import AddCourse from './components/AddCourse'
import AllCourses from './components/AllCourses'
import EditCourse from './components/EditCourse'
import { useThemeStore } from '../../../store'

const Courses = () => {
  const { isDarkMode } = useThemeStore();
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editCourse, setEditCourse] = useState(null)

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
        setShowAdd(false)
        fetchCourses()
      } else {
        setError(data.message || 'Failed to add course')
      }
    } catch (err) {
      setError('Failed to add course')
    } finally {
      setLoading(false)
    }
  }

  // Edit course
  const handleEditCourse = (course) => {
    setEditCourse(course)
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
        setEditCourse(null)
        fetchCourses()
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
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          onClick={() => setShowAdd(true)}
        >
          + Add Course
        </button>
      </div>
      {/* Add/Edit Forms */}
      {showAdd && (
        <div className="mb-4">
          <AddCourse onCourseCreated={handleAddCourse} onCancel={() => setShowAdd(false)} loading={loading} />
        </div>
      )}
      {editCourse && (
        <div className="mb-4">
          <EditCourse course={editCourse} onCourseUpdated={handleUpdateCourse} onCancel={() => setEditCourse(null)} loading={loading} />
        </div>
      )}
      {/* All Courses Table */}
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <AllCourses
          courses={courses}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Courses;