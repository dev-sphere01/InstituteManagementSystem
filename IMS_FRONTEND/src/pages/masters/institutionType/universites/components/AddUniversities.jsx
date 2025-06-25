import React, { useState } from 'react';
import API from './../../../../../services/API';
import { useNotification } from './../../../../../services/NotificationService';
import { useThemeStore } from './../../../../../store';

const AddUniversity = ({ onCancel, onUniversityCreated }) => {
  const { isDarkMode, colors } = useThemeStore();
  const notify = useNotification();
  const [universityName, setUniversityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!universityName.trim()) {
      setError('University name is required');
      notify('University name is required', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/universities', { universityName });
      notify('University created successfully', 'success');
      onUniversityCreated(res.data.data);
      setUniversityName('');
      setError('');
      onCancel();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create university';
      // Show duplicate error under field
      if (msg.toLowerCase().includes('duplicate') && msg.toLowerCase().includes('universityname')) {
        setError(msg);
      }
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-md p-6 shadow-md border ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-300'}`}>
      <h2 className="text-lg font-semibold mb-4">Add New University</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">University Name</label>
          <input
            type="text"
            value={universityName}
            onChange={(e) => { setUniversityName(e.target.value); setError(''); }}
            className={`w-full px-3 py-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
            placeholder="Enter university name"
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
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
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUniversity;
