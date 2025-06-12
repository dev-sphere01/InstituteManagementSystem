import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import useUserStore from '../../../../store/useUserStore';
import { usePermissions } from '../../../../components/PermissionGuard';

const UserDetails = ({ userId, onBack, onEdit }) => {
  const { isDarkMode } = useThemeStore();
  const { hasPermission } = usePermissions();
  const { currentUser, loading, error, fetchUserById, updateUserStatus } = useUserStore();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, fetchUserById]);

  const handleStatusChange = async (newIsActive) => {
    setIsUpdatingStatus(true);
    try {
      // Convert string to boolean if needed
      const isActiveValue = newIsActive === 'true' || newIsActive === true;
      await updateUserStatus(userId, isActiveValue);
      // Refresh user data
      fetchUserById(userId);
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleActivateUser = async () => {
    try {
      await updateUserStatus(userId, true); // Set isActive to true
      // Refresh user data
      fetchUserById(userId);
    } catch (err) {
      console.error('Activate user error:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isActive) => {
    const isActiveStatus = isActive === true || isActive === 'true';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isActiveStatus
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }`}>
        {isActiveStatus ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const isUserInactive = (user) => {
    return user?.isActive === false;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="p-6">
        <div className={`rounded-md p-4 ${
          isDarkMode ? 'bg-red-900/50 border border-red-800' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                Error loading user details
              </h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                <p>{error || 'User not found'}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onBack}
                  className={`text-sm font-medium ${
                    isDarkMode 
                      ? 'text-red-200 hover:text-red-100' 
                      : 'text-red-800 hover:text-red-700'
                  } underline`}
                >
                  Back to Users
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
        <div className="flex items-center space-x-4">
          <img
            className="h-16 w-16 rounded-full"
            src={currentUser.avatar?.url || 'https://via.placeholder.com/64'}
            alt={currentUser.name}
          />
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentUser.name}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentUser.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge(currentUser.isActive)}
              {isUserInactive(currentUser) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`inline-flex items-center px-4 py-2 border ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          {hasPermission('user.update') && (
            <button
              onClick={() => onEdit(userId)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit User
            </button>
          )}
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Full Name
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {currentUser.name}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Email Address
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {currentUser.email}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Role
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {currentUser.role?.RoleName || 'No Role Assigned'}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Status
              </dt>
              <dd className="text-sm">
                {getStatusBadge(currentUser.isActive)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Account Activity */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Activity
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Last Login
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {formatDate(currentUser.lastLogin)}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Account Created
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {formatDate(currentUser.createdAt)}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Last Updated
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {formatDate(currentUser.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Login Attempts
              </dt>
              <dd className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {currentUser.loginAttempts || 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Actions */}
      {hasPermission('user.update') && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {/* Status Change */}
            <select
              value={currentUser.isActive ? 'true' : 'false'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className={`px-3 py-2 border rounded-md text-sm ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Activate User */}
            {isUserInactive(currentUser) && (
              <button
                onClick={handleActivateUser}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activate User
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
