import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import useUserStore from '../../../../store/useUserStore';
import useRoleStore from '../../../../store/useRoleStore';

const EditUser = ({ userId, onBack, onSuccess }) => {
  const { isDarkMode } = useThemeStore();
  const { currentUser, loading, error, fetchUserById, updateUser } = useUserStore();
  const { roles, fetchRoles } = useRoleStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: [],
    isActive: true
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, fetchUserById, fetchRoles]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        roles: ((currentUser.roles && currentUser.roles.length > 0)
          ? currentUser.roles
          : (currentUser.role ? [currentUser.role] : [])
        ).map((r) => (typeof r === 'object' && r !== null ? r._id : r)).filter(Boolean),
        isActive: currentUser.isActive !== undefined ? currentUser.isActive : true
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleRole = (roleId) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(roleId);
      const roles = exists ? prev.roles.filter((id) => id !== roleId) : [...prev.roles, roleId];
      return { ...prev, roles };
    });

    if (validationErrors.roles) {
      setValidationErrors((prev) => ({ ...prev, roles: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.roles || formData.roles.length === 0) {
      errors.roles = 'Please select at least one role';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.roles[0],
        roles: formData.roles,
        isActive: formData.isActive
      };

      const result = await updateUser(userId, userData);

      if (result.success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Update user error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !currentUser) {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit User
          </h2>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Update user information and permissions
          </p>
        </div>
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
          Back to Users
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-6 rounded-md p-4 ${
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
                Error updating user
              </h3>
              <div className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.name
                  ? isDarkMode
                    ? 'border-red-600 bg-gray-700 text-white'
                    : 'border-red-300 bg-white text-gray-900'
                  : isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter full name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email
                  ? isDarkMode
                    ? 'border-red-600 bg-gray-700 text-white'
                    : 'border-red-300 bg-white text-gray-900'
                  : isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter email address"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roles */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Roles <span className="text-red-500">*</span>
            </label>
            <div className={`rounded-md border p-3 space-y-2 ${
              validationErrors.roles
                ? isDarkMode
                  ? 'border-red-600 bg-gray-700'
                  : 'border-red-300 bg-white'
                : isDarkMode
                  ? 'border-gray-600 bg-gray-700'
                  : 'border-gray-300 bg-white'
            }`}>
              {roles.map((role) => (
                <label key={role._id} className={`flex items-center gap-2 text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role._id)}
                    onChange={() => toggleRole(role._id)}
                  />
                  {role.RoleName} - {role.description}
                </label>
              ))}
            </div>
            {validationErrors.roles && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.roles}</p>
            )}
            <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              The first selected role is treated as the primary role.
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="isActive" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
            <select
              id="isActive"
              name="isActive"
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onBack}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting || loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating User...
              </div>
            ) : (
              'Update User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

