import React, { useState } from 'react';
import { useThemeStore } from './../../../../../store';
import { useNotification } from '../../../../../services/NotificationService';

const EditBoard = ({ board, onBoardUpdated, onCancel, loading }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState(board);
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
    try {
      await onBoardUpdated(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Board</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Update board name</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Board Name <span className="text-red-500">*</span>
          </label>
          <input
            name="boardName"
            value={form.boardName}
            onChange={handleChange}
            placeholder="Enter board name"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.boardName
                ? 'border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          />
          {errors.boardName && <p className="mt-1 text-sm text-red-600">{errors.boardName}</p>}
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
            disabled={isSubmitting || loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting || loading ? 'Updating...' : 'Update Board'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBoard;
