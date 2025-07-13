import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../../../../store';
import { useNotification } from '../../../../../../services/NotificationService';
import API from '../../../../../../services/API';

const Features = ({ formData = {}, setFormData = () => {}, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const features = formData.features || {};
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableFeatures = async () => {
    setLoading(true);
    try {
      const res = await API.get('/additional-features?status=active');
      setAvailableFeatures(res?.data || []);
    } catch (err) {
      notify('Failed to fetch features from server', 'error');
    } finally {
      setLoading(false);
    }
  };
  console.log(availableFeatures);
  useEffect(() => {
    fetchAvailableFeatures();
  }, []);

  const handleCheckboxChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: !prev.features?.[key],
      },
    }));
  };

  return (
    <div
      className={`w-full rounded-2xl shadow-md p-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 text-white'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 text-gray-900'
      }`}
    >
      <h3 className="text-xl font-bold mb-6">Additional Features</h3>

      {loading ? (
        <p className="text-blue-400 animate-pulse">Loading features...</p>
      ) : availableFeatures.length === 0 ? (
        <p className="text-gray-400">No active features available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableFeatures.map(({ _id, additionalFeatures }) => (
            <label
              key={_id}
              className={`flex items-center gap-3 text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              <input
                type="checkbox"
                checked={!!features[_id]}
                onChange={() => handleCheckboxChange(_id)}
                className={`w-4 h-4 rounded border focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-blue-400 focus:ring-offset-gray-900'
                    : 'bg-white border-gray-300 text-blue-600 focus:ring-offset-white'
                }`}
              />
              {additionalFeatures}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Features;
