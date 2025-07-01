import React, { useState } from 'react';
import API from './../../../../../services/API';
import { useThemeStore } from './../../../../../store';
import { useNotification } from './../../../../../services/NotificationService';

const AddBoard = ({ onBoardCreated, onCancel, loading: parentLoading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState({ boardName: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.boardName.trim()) errs.boardName = 'Board name is required';
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
    setErrors({});
    try {
      await API.post('/boards', form);
      notify('Board added successfully', 'success');
      if (onCancel) onCancel();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add board';
      // If duplicate error, show under field
      if (msg.toLowerCase().includes('duplicate') && msg.toLowerCase().includes('boardname')) {
        setErrors({ boardName: msg });
      } else {
        setErrors({});
      }
      notify(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-w-xl mx-auto`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Board</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Board Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="boardName"
            value={form.boardName}
            onChange={handleChange}
            placeholder="Enter board name"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.boardName ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            }`}
            disabled={isSubmitting || parentLoading}
          />
          {errors.boardName && <p className="mt-1 text-sm text-red-500">{errors.boardName}</p>}
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
            disabled={isSubmitting || parentLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parentLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || parentLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting || parentLoading ? 'Adding...' : 'Add Board'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBoard;
