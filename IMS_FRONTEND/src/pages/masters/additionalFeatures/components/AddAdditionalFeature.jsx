// pages/masters/additional-features/components/AddAdditionalFeature.jsx
import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';

const AddAdditionalFeature = ({ onSubmit, onCancel, loading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [formData, setFormData] = useState({
    additionalFeatures: '',
    description: '',
    type: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.additionalFeatures.trim()) newErrors.additionalFeatures = 'Feature name is required';
    // if (!formData.type) newErrors.type = 'Type is required';//removed from model
    if (!formData.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      notify('Please fix the form errors.', 'error');
      return;
    }
    await onSubmit(formData);
  };

  const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const errorClasses = 'mt-1 text-sm text-red-600 dark:text-red-400';

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Add New Feature
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Name */}
          <div>
            <label className="block text-sm font-medium">Feature Name *</label>
            <input
              type="text"
              name="additionalFeatures"
              value={formData.additionalFeatures}
              onChange={handleChange}
              placeholder="e.g., Extra Library Access"
              className={`${inputClasses} ${errors.additionalFeatures ? 'border-red-500' : ''}`}
            />
            {errors.additionalFeatures && <p className={errorClasses}>{errors.additionalFeatures}</p>}
          </div>

          {/* Type */}
          {/* <div>
            <label className="block text-sm font-medium">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`${inputClasses} ${errors.type ? 'border-red-500' : ''}`}
            >
              <option value="">Select Type</option>
              <option value="feature">Feature</option>
              <option value="addon">Addon</option>
              <option value="service">Service</option>
              <option value="upgrade">Upgrade</option>
            </select>
            {errors.type && <p className={errorClasses}>{errors.type}</p>}
          </div> */}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputClasses} ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="deprecated">Deprecated</option>
            </select>
            {errors.status && <p className={errorClasses}>{errors.status}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description (optional)"
              className={`${inputClasses}`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Feature'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdditionalFeature;
