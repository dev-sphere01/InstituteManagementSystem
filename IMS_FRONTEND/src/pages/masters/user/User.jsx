import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../store';
import useUserStore from '../../../store/useUserStore';
import useRoleStore from '../../../store/useRoleStore';
import PermissionGuard from '../../../components/PermissionGuard';
import AllUsers from './Components/AllUsers';
import AddUser from './Components/AddUser';
import EditUser from './Components/EditUser';
import UserDetails from './Components/UserDetails';

export const User = () => {
  const { isDarkMode } = useThemeStore();
  const { fetchUsers, fetchUserStats } = useUserStore();
  const { fetchRoles } = useRoleStore();

  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit', 'view'
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    // Fetch initial data
    fetchUsers();
    fetchUserStats();
    fetchRoles();
  }, [fetchUsers, fetchUserStats, fetchRoles]);

  const handleViewChange = (view, userId = null) => {
    setCurrentView(view);
    setSelectedUserId(userId);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedUserId(null);
    // Refresh the users list
    fetchUsers();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'add':
        return (
          <PermissionGuard permissions={['user.create']}>
            <AddUser onBack={handleBackToList} onSuccess={handleBackToList} />
          </PermissionGuard>
        );

      case 'edit':
        return (
          <PermissionGuard permissions={['user.update']}>
            <EditUser
              userId={selectedUserId}
              onBack={handleBackToList}
              onSuccess={handleBackToList}
            />
          </PermissionGuard>
        );

      case 'view':
        return (
          <PermissionGuard permissions={['user.read']}>
            <UserDetails
              userId={selectedUserId}
              onBack={handleBackToList}
              onEdit={(userId) => handleViewChange('edit', userId)}
            />
          </PermissionGuard>
        );

      default:
        return (
          <PermissionGuard permissions={['user.read']}>
            <AllUsers
              onAdd={() => handleViewChange('add')}
              onEdit={(userId) => handleViewChange('edit', userId)}
              onView={(userId) => handleViewChange('view', userId)}
            />
          </PermissionGuard>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              User Management
            </span>
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Breadcrumb */}
        {currentView !== 'list' && (
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => handleViewChange('list')}
                  className={`text-sm font-medium ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                >
                  Users
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
                  {currentView === 'add' && 'Add User'}
                  {currentView === 'edit' && 'Edit User'}
                  {currentView === 'view' && 'User Details'}
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
