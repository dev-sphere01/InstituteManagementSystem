import React, { useEffect } from 'react';
import Referral from './components/Referral';
import ComputerAccess from './components/ComputerAccess';
import Features from './components/Features';
import { useThemeStore } from '../../../../../store';
import API from './../../../../../services/api';
import { useNotification } from './../../../../../services/NotificationService';

const Extras = ({ formData = {}, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  // Default structure to prevent undefined errors
  const defaultFormData = {
    referral: {
      referralSource: '',
      referralSourceOther: '',
      referalName: '',
    },
    computerAccess: {
      location: '',
      otherLocation: '',
    },
    features: {
      tShirt: false,
      itTools: false,
      webDesigning: false,
      tally: false,
      gfxDtp: false,
      python: false,
      iot: false,
    },
  };

  // Combine existing formData with safe defaults
  const safeFormData = {
    ...defaultFormData,
    ...formData,
    referral: {
      ...defaultFormData.referral,
      ...(formData?.referral || {}),
    },
    computerAccess: {
      ...defaultFormData.computerAccess,
      ...(formData?.computerAccess || {}),
    },
    features: {
      ...defaultFormData.features,
      ...(formData?.features || {}),
    },
  };

  // Fetch previous step data from API on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!formData?._id) return;

        const { data } = await API.get(`/admissions/${formData._id}`);

        setFormData((prev) => ({
          ...prev,
          ...data,
          referral: {
            referralSource: data?.referralSource || '',
            referralSourceOther: data?.referralSourceOther || '',
            referalName: data?.referalName || '',
          },
          computerAccess: {
            location: data?.computerAccessOther || '',
            otherLocation: data?.computerAccessOther || '',
          },
          features: {
            tShirt: data?.tShirt || false,
            itTools: data?.itTools || false,
            webDesigning: data?.webDesigning || false,
            tally: data?.tally || false,
            gfxDtp: data?.gfxDtp || false,
            python: data?.python || false,
            iot: data?.iot || false,
          },
        }));
      } catch (err) {
        console.error('Failed to fetch Extras data:', err);
        notify('Failed to load previous data for Extras.', 'error');
      }
    };

    fetchData();
  }, [formData?._id]);

  const handleSubmit = () => {
    const { features, referral, computerAccess } = safeFormData;

    const flattenedData = {
      ...formData, // keep original _id and other values

      // Flatten features
      tShirt: features.tShirt || false,
      itTools: features.itTools || false,
      webDesigning: features.webDesigning || false,
      tally: features.tally || false,
      gfxDtp: features.gfxDtp || false,
      python: features.python || false,
      iot: features.iot || false,

      // Flatten referral
      referralSource: referral.referralSource || '',
      referralSourceOther: referral.referralSourceOther || '',
      referalName: referral.referalName || '',

      // Flatten computer access
      computerAccess: !!computerAccess.location,
      computerAccessOther:
        computerAccess.location === 'Other'
          ? computerAccess.otherLocation || ''
          : computerAccess.location || '',
    };

    if (typeof onNext === 'function') {
      onNext(flattenedData);
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
          formData={safeFormData}
          setFormData={setFormData}
          validationsEnabled={validationsEnabled}
        />
        <ComputerAccess
          formData={safeFormData}
          setFormData={setFormData}
          validationsEnabled={validationsEnabled}
        />
        <Referral
          formData={safeFormData}
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
          className="px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Extras;
