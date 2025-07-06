import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import AddCenterCode from './components/AddCenterCode';
import AllCenterCode from './components/AllCenterCode';
import EditCenterCode from './components/EditCenterCode';
import API from '../../../services/API';
import { useNotification } from '../../../services/NotificationService';

const CenterCode = () => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [centerCodes, setCenterCodes] = useState([]);
  const [editingCenterCode, setEditingCenterCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCenterCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/centre-codes');
      setCenterCodes(res.data);
    } catch (err) {
      setError('Failed to fetch center codes');
      notify('Failed to fetch center codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenterCodes();
    // eslint-disable-next-line
  }, []);

  const handleEditCenterCode = (centerCode) => {
    setEditingCenterCode(centerCode);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingCenterCode(null);
    setActiveTab('all');
  };

  const handleCenterCodeCreated = async (newCenterCode) => {
    try {
      setLoading(true);
      const res = await API.post('/centre-codes', newCenterCode);
      setCenterCodes([...centerCodes, res.data]);
      setActiveTab('all');
      notify('Center code created successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create center code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCenterCodeUpdated = async (updatedCenterCode) => {
    try {
      setLoading(true);
      const res = await API.put(`/centre-codes/${updatedCenterCode._id}`, updatedCenterCode);
      setCenterCodes(centerCodes.map((cc) => (cc._id === updatedCenterCode._id ? res.data : cc)));
      setEditingCenterCode(null);
      setActiveTab('all');
      notify('Center code updated successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update center code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCenterCodeDeleted = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/centre-codes/${id}`);
      setCenterCodes(centerCodes.filter((cc) => cc._id !== id));
      notify('Center code deleted successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete center code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Center Codes', icon: '📋' },
    { id: 'add', label: 'Add Center Code', icon: '➕' },
  ];

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Center Code Master
            </span>
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage all center codes in the system
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
          {editingCenterCode && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'edit'
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } hover:border-gray-300`
              }`}
            >
              <span className="mr-2">✏️</span>
              Edit Center Code
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllCenterCode
            centerCodes={centerCodes}
            onEditCenterCode={handleEditCenterCode}
            onDeleteCenterCode={handleCenterCodeDeleted}
            loading={loading}
            error={error}
          />
        )}
        {activeTab === 'add' && (
          <AddCenterCode 
            onCenterCodeCreated={handleCenterCodeCreated}
            onCancel={() => setActiveTab('all')} 
            loading={loading} 
          />
        )}
        {activeTab === 'edit' && editingCenterCode && (
          <EditCenterCode
            centerCode={editingCenterCode}
            onCenterCodeUpdated={handleCenterCodeUpdated}
            onClose={handleCloseEdit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CenterCode;