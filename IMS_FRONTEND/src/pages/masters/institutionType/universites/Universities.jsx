import React, { useEffect, useState } from 'react';
import API from './../../../../services/API';
import { useNotification } from './../../../../services/NotificationService';
import AddUniversity from './components/AddUniversities';
import EditUniversity from './components/EditUinversities';
import AllUniversities from './components/AllUniversities';
import { useThemeStore } from './../../../../store';

const UniversityMaster = () => {
  const notify = useNotification();
  const { isDarkMode } = useThemeStore();

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchUniversities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/universities');
      // Defensive: always expect array of objects with universityName
      let data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
      // Filter out any undefined/null/invalid objects
      data = data.filter(u => u && typeof u === 'object' && typeof u.universityName === 'string');
      setUniversities(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load universities');
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleUniversityCreated = (newUniversity) => {
    // Defensive: only add if valid
    if (newUniversity && typeof newUniversity.universityName === 'string') {
      setUniversities((prev) => [newUniversity, ...prev]);
    }
    setActiveTab('all');
  };

  const handleUniversityUpdated = async (updatedUniversity) => {
    try {
      const res = await API.put(
        `/universities/${updatedUniversity._id}`,
        updatedUniversity
      );
      setUniversities((prev) =>
        prev.map((u) => (u._id === updatedUniversity._id ? res.data.data : u))
      );
      setEditingUniversity(null);
      notify('University updated successfully', 'success');
    } catch (err) {
      notify(
        err.response?.data?.message || 'Failed to update university',
        'error'
      );
    }
  };

  const handleDeleteUniversity = async (id) => {
    try {
      await API.delete(`/universities/${id}`);
      setUniversities((prev) => prev.filter((u) => u._id !== id));
      notify('University deleted successfully', 'success');
    } catch (err) {
      notify(
        err.response?.data?.message || 'Failed to delete university',
        'error'
      );
    }
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            University Master
          </span>
        </h1>
        <p className="text-sm text-gray-400">
          Manage all academic universities in the system
        </p>
      </div>

      {/* Tabs */}
<div className="border-b border-gray-200 dark:border-gray-700 flex space-x-6 text-sm font-medium">
  <button
    className={`flex items-center gap-1 py-2 px-2 border-b-2 transition-colors duration-200
      ${activeTab === 'all'
        ? 'border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400'
        : 'border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
      }`}
    onClick={() => {
      setEditingUniversity(null);
      setActiveTab('all');
    }}
  >
    📋 All Universities
  </button>

  <button
    className={`flex items-center gap-1 py-2 px-2 border-b-2 transition-colors duration-200
      ${activeTab === 'add'
        ? 'border-purple-500 text-purple-500 dark:border-purple-400 dark:text-purple-400'
        : 'border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
      }`}
    onClick={() => {
      setEditingUniversity(null);
      setActiveTab('add');
    }}
  >
    ➕ Add University
  </button>
</div>


      {/* Content Area */}
      <div>
        {editingUniversity ? (
          <EditUniversity
            university={editingUniversity}
            onCancel={() => setEditingUniversity(null)}
            onUniversityUpdated={handleUniversityUpdated}
          />
        ) : activeTab === 'add' ? (
          <AddUniversity
            onCancel={() => setActiveTab('all')}
            onUniversityCreated={handleUniversityCreated}
          />
        ) : (
          <AllUniversities
            universities={universities}
            onEditUniversity={(university) => {
              setEditingUniversity(university);
              setActiveTab('');
            }}
            onDeleteUniversity={handleDeleteUniversity}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default UniversityMaster;
