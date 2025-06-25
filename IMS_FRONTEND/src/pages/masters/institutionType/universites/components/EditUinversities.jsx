import React, { useState } from 'react';
import API from '../../../../../services/API';
import { useNotification } from '../../../../../services/NotificationService';
import { useThemeStore } from '../../../../../store';

const EditUniversity = ({ university, onCancel, onUniversityUpdated }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState(university);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.universityName.trim()) errs.universityName = 'University name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await API.put(`/universities/${form._id}`, { universityName: form.universityName });
      onUniversityUpdated(res.data.data);
      notify('University updated successfully', 'success');
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to update university', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit University</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Update university name</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* University Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            University Name <span className="text-red-500">*</span>
          </label>
          <input
            name="universityName"
            value={form.universityName}
            onChange={handleChange}
            placeholder="Enter university name"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.universityName
                ? 'border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.universityName && <p className="mt-1 text-sm text-red-600">{errors.universityName}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md font-medium transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update University'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUniversity;
