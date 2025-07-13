import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';

const AddCenterCode = ({ onCenterCodeCreated, onCancel, loading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [formData, setFormData] = useState({
    centreCode: '',
    name: '',
    State: '',
    City: '',
    address: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? (value ? Number(value) : '') : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.centreCode.trim()) {
      newErrors.centreCode = 'Centre code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Centre name is required';
    }

    if (!formData.State.trim()) {
      newErrors.State = 'State is required';
    }

    if (!formData.City.trim()) {
      newErrors.City = 'City is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && formData.phone.toString().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify('Please fix the errors in the form', 'error');
      return;
    }

    // Clean up the form data
    const cleanedData = {
      ...formData,
      centreCode: formData.centreCode.trim(),
      name: formData.name.trim(),
      State: formData.State.trim(),
      City: formData.City.trim(),
      address: formData.address.trim() || undefined,
      phone: formData.phone || undefined,
      email: formData.email.trim() || undefined,
    };

    await onCenterCodeCreated(cleanedData);
  };

  const handleReset = () => {
    setFormData({
      centreCode: '',
      name: '',
      State: '',
      City: '',
      address: '',
      phone: '',
      email: '',
    });
    setErrors({});
  };

  const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const errorClasses = 'mt-1 text-sm text-red-600 dark:text-red-400';

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Add New Center Code
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Centre Code */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Centre Code *
            </label>
            <input
              type="text"
              name="centreCode"
              value={formData.centreCode}
              onChange={handleInputChange}
              placeholder="Enter centre code"
              className={`${inputClasses} ${errors.centreCode ? 'border-red-500' : ''}`}
              required
            />
            {errors.centreCode && <p className={errorClasses}>{errors.centreCode}</p>}
          </div>

          {/* Centre Name */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Centre Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter centre name"
              className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && <p className={errorClasses}>{errors.name}</p>}
          </div>

          {/* State */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              State *
            </label>
            <input
              type="text"
              name="State"
              value={formData.State}
              onChange={handleInputChange}
              placeholder="Enter state"
              className={`${inputClasses} ${errors.State ? 'border-red-500' : ''}`}
              required
            />
            {errors.State && <p className={errorClasses}>{errors.State}</p>}
          </div>

          {/* City */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              City *
            </label>
            <input
              type="text"
              name="City"
              value={formData.City}
              onChange={handleInputChange}
              placeholder="Enter city"
              className={`${inputClasses} ${errors.City ? 'border-red-500' : ''}`}
              required
            />
            {errors.City && <p className={errorClasses}>{errors.City}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className={`${inputClasses} ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={`${inputClasses} ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className={errorClasses}>{errors.email}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter complete address"
            rows="3"
            className={`${inputClasses} ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && <p className={errorClasses}>{errors.address}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Center Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCenterCode;