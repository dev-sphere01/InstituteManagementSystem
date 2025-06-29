import React from 'react';
import Referral from './components/Referral';
import ComputerAccess from './components/ComputerAccess';
import Features from './components/Features';
import { useThemeStore } from '../../../../../store';

const Extras = ({ formData, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();

  const handleSubmit = () => {
    // Optional: Add any final validation here if needed
    if (typeof onNext === 'function') {
      onNext(formData); // Pass all extras-related fields
    }
  };

  return (
    <div
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-8 tracking-tight ${
          isDarkMode ? 'text-white' : 'text-blue-900'
        }`}
      >
        Step 4: Additional Details
      </h2>

      <div className="space-y-8">
        <Features
          formData={formData}
          setFormData={setFormData}
          validationsEnabled={validationsEnabled}
        />
        <ComputerAccess
          formData={formData}
          setFormData={setFormData}
          validationsEnabled={validationsEnabled}
        />
        <Referral
          formData={formData}
          setFormData={setFormData}
          validationsEnabled={validationsEnabled}
        />
      </div>

      <div className="flex items-center justify-between pt-8 border-t mt-8 border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
              : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Extras;
