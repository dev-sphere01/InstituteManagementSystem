import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import AddCourse from './components/AddCourse';
import AllCourses from './components/AllCourses';
import EditCourse from './components/EditCourse';
import API from '../../../services/API';
import { useNotification } from '../../../services/NotificationService';

const Courses = () => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/courses');
      setCourses(res?.data || []);
    } catch (err) {
      setError('Failed to fetch courses');
      notify('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingCourse(null);
    setActiveTab('all');
  };

  const handleCourseUpdated = async (updatedCourse) => {
    try {
      setLoading(true);
      const res = await API.put(`/courses/${updatedCourse._id}`, updatedCourse);
      setCourses(courses.map((c) => (c._id === updatedCourse._id ? res.data.data : c)));
      setEditingCourse(null);
      setActiveTab('all');
      notify('Course updated successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseDeleted = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/courses/${id}`);
      setCourses(courses.filter((c) => c._id !== id));
      notify('Course deleted successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Courses', icon: '📚' },
    { id: 'add', label: 'Add Course', icon: '➕' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Course Master
            </span>
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage all academic courses in the system
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {editingCourse && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'edit'
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                }`}
            >
              <span className="mr-2">✏️</span>
              Edit Course
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllCourses
            courses={courses}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleCourseDeleted}
            loading={loading}
            error={error}
          />
        )}
        {activeTab === 'add' && (
          <AddCourse onCancel={() => setActiveTab('all')} loading={loading} />
        )}
        {activeTab === 'edit' && editingCourse && (
          <EditCourse
            course={editingCourse}
            onCourseUpdated={handleCourseUpdated}
            onClose={handleCloseEdit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Courses;
