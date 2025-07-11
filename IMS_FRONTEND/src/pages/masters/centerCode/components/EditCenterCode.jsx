import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';

const EditCenterCode = ({ centerCode, onCenterCodeUpdated, onClose, loading }) => {
  const { isDarkMode } = useThemeStore();
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

  useEffect(() => {
    if (centerCode) {
      setFormData({
        centreCode: centerCode.centreCode || '',
        name: centerCode.name || '',
        State: centerCode.State || '',
        City: centerCode.City || '',
        address: centerCode.address || '',
        phone: centerCode.phone || '',
        email: centerCode.email || '',
      });
    }
  }, [centerCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.centreCode.trim()) {
      newErrors.centreCode = 'Centre Code is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Centre Name is required';
    }
    
    if (!formData.State.trim()) {
      newErrors.State = 'State is required';
    }
    
    if (!formData.City.trim()) {
      newErrors.City = 'City is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Fixed phone validation - check if phone exists and is a string before calling replace
    if (formData.phone && typeof formData.phone === 'string' && formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(phoneDigits)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const updatedCenterCode = {
      ...centerCode,
      ...formData,
    };
    
    onCenterCodeUpdated(updatedCenterCode);
  };

  const inputClassName = `block w-full rounded-md border ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;

  const errorClassName = 'mt-1 text-sm text-red-600 dark:text-red-400';

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Edit Center Code
        </h2>
        <button
          onClick={onClose}
          className={`text-gray-400 hover:text-gray-600 ${isDarkMode ? 'hover:text-gray-200' : ''}`}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Centre Code */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Centre Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="centreCode"
              value={formData.centreCode}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter centre code"
              disabled={loading}
            />
            {errors.centreCode && <p className={errorClassName}>{errors.centreCode}</p>}
          </div>

          {/* Centre Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Centre Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter centre name"
              disabled={loading}
            />
            {errors.name && <p className={errorClassName}>{errors.name}</p>}
          </div>

          {/* State */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="State"
              value={formData.State}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter state"
              disabled={loading}
            />
            {errors.State && <p className={errorClassName}>{errors.State}</p>}
          </div>

          {/* City */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="City"
              value={formData.City}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter city"
              disabled={loading}
            />
            {errors.City && <p className={errorClassName}>{errors.City}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter phone number"
              disabled={loading}
            />
            {errors.phone && <p className={errorClassName}>{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && <p className={errorClassName}>{errors.email}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={inputClassName}
            placeholder="Enter full address"
            disabled={loading}
          />
          {errors.address && <p className={errorClassName}>{errors.address}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Updating...' : 'Update Center Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCenterCode;