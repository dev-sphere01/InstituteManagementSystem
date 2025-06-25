import React, { useState } from 'react';
import API from '../../../../../services/API';
import { useNotification } from '../../../../../services/NotificationService';
import {useThemeStore} from '../../../../../store';

const EditUniversity = ({ university, onCancel, onUniversityUpdated }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [universityName, setUniversityName] = useState(university.universityName);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!universityName.trim()) {
      notify('University name is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await API.put(`/universities/${university._id}`, { universityName });
      notify('University updated successfully', 'success');
      onUniversityUpdated(res.data.data);
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to update university', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-md p-6 shadow-md border ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-300'}`}>
      <h2 className="text-lg font-semibold mb-4">Edit University</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">University Name</label>
          <input
            type="text"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
            placeholder="Enter university name"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-black rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUniversity;
