import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const AddSession = ({ onSessionCreated, onCancel, loading: parentLoading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [form, setForm] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    isActive: true,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.sessionName.trim()) errs.sessionName = 'Session name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    console.log("Submit button cilcked !", { isSubmitting, parentLoading });
    e.preventDefault();
    const isValid = validate();
    console.log("Validation result:", isValid, form);
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
      };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      console.log("About to post:", payload);
      const res = await API.post('/sessions', payload);
      if (typeof onSessionCreated === 'function') onSessionCreated(res.data.data);
      notify('Session added successfully', 'success');
      if (onCancel) onCancel();
    } catch (err) {
      console.error("API error:", err);
      notify(err.response?.data?.message || 'Failed to add session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-w-2xl mx-auto`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Session Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="sessionName"
              value={form.sessionName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.sessionName ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Enter session name"
              disabled={isSubmitting || parentLoading}
            />
            {errors.sessionName && <p className="mt-1 text-sm text-red-500">{errors.sessionName}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.startDate ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              disabled={isSubmitting || parentLoading}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.endDate ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              disabled={isSubmitting || parentLoading}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
          </div>
         
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
            placeholder="Enter session description (optional)"
            rows={2}
            disabled={isSubmitting || parentLoading}
          />
        </div>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting || parentLoading}
          />
          <label className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active</label>
        </div>
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            disabled={isSubmitting || parentLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting || parentLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting || parentLoading ? 'Adding...' : 'Add Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSession;
