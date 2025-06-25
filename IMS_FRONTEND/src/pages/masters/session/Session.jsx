import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import AddSession from './components/AddSession';
import AllSessions from './components/AllSessions';
import EditSession from './components/EditSession';
import API from '../../../services/API';
import { useNotification } from '../../../services/NotificationService';

const Session = () => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/sessions');
      // console.log("API call response",res.data)
      setSessions(res?.data);
      // console.log("Post State Set -",sessions)
    } catch (err) {
      setError('Failed to fetch sessions');
      notify('Failed to fetch sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, []);

  const handleEditSession = (session) => {
    setEditingSession(session);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingSession(null);
    setActiveTab('all');
  };

  const handleSessionUpdated = async (updatedSession) => {
    try {
      setLoading(true);
      const res = await API.put(`/sessions/${updatedSession._id}`, updatedSession);
      setSessions(sessions.map((s) => (s._id === updatedSession._id ? res.data.data : s)));
      setEditingSession(null);
      setActiveTab('all');
      notify('Session updated successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionDeleted = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/sessions/${id}`);
      setSessions(sessions.filter((s) => s._id !== id));
      notify('Session deleted successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Sessions', icon: '📅' },
    { id: 'add', label: 'Add Session', icon: '➕' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Session Master
            </span>
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage all academic sessions in the system</p>
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
          {editingSession && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'edit'
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                }`}
            >
              <span className="mr-2">✏️</span>
              Edit Session
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllSessions
            sessions={sessions}
            onEditSession={handleEditSession}
            onDeleteSession={handleSessionDeleted}
            loading={loading}
            error={error}
          />
        )}
        {activeTab === 'add' && (
          <AddSession onCancel={() => setActiveTab('all')} loading={loading} />
        )}
        {activeTab === 'edit' && editingSession && (
          <EditSession
            session={editingSession}
            onSessionUpdated={handleSessionUpdated}
            onClose={handleCloseEdit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Session;