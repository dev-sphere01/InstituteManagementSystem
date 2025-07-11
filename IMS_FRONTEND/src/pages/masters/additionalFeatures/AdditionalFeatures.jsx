// pages/masters/additional-features/AdditionalFeatures.jsx
import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import AddAdditionalFeature from './components/AddAdditionalFeature';
import AllAdditionalFeatures from './components/AllAdditionalFeatures';
import EditAdditionalFeature from './components/EditAdditionalFeature';
import API from '../../../services/API';
import { useNotification } from '../../../services/NotificationService';

const AdditionalFeatures = () => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState('all');
  const [features, setFeatures] = useState([]);
  const [editingFeature, setEditingFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/additional-features');
      setFeatures(res?.data || []);
    } catch (err) {
      setError('Failed to fetch features');
      notify('Failed to fetch additional features', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      const res = await API.post('/additional-features', formData);
      setFeatures([...features, res.data.data]);
      notify('Feature created successfully', 'success');
      setActiveTab('all');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create feature', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      const res = await API.put(`/additional-features/${formData._id}`, formData);
      setFeatures(features.map(f => (f._id === formData._id ? res.data.data : f)));
      notify('Feature updated successfully', 'success');
      setActiveTab('all');
      setEditingFeature(null);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update feature', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/additional-features/${id}`);
      setFeatures(features.filter(f => f._id !== id));
      notify('Feature deleted successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete feature', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Features', icon: '🧩' },
    { id: 'add', label: 'Add Feature', icon: '➕' },
  ];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Additional Features Master
            </span>
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage all additional features for your institute
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } hover:border-gray-300`
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {editingFeature && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'edit'
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } hover:border-gray-300`
              }`}
            >
              ✏️ Edit Feature
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllAdditionalFeatures
            features={features}
            loading={loading}
            error={error}
            onEdit={f => {
              setEditingFeature(f);
              setActiveTab('edit');
            }}
            onDelete={handleDelete}
          />
        )}
        {activeTab === 'add' && (
          <AddAdditionalFeature loading={loading} onSubmit={handleCreate} onCancel={() => setActiveTab('all')} />
        )}
        {activeTab === 'edit' && editingFeature && (
          <EditAdditionalFeature
            feature={editingFeature}
            loading={loading}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingFeature(null);
              setActiveTab('all');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdditionalFeatures;
