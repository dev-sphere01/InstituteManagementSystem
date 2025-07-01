import React, { useEffect, useRef, useState } from 'react';
import Referral from './components/Referral';
import ComputerAccess from './components/ComputerAccess';
import Features from './components/Features';
import { useThemeStore } from '../../../../../store';
import API from './../../../../../services/api';
import { useNotification } from './../../../../../services/NotificationService';

const Extras = ({ formId,formData = {}, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const hasFetchedRef = useRef(false);
  const [loading, setLoading] = useState(false);

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
  const accessOptions = [
    'Home',
    'Cyber Cafe',
    'Institute Provided',
    'No Access',
    'Other',
  ];
  
  // 🔁 Load existing Extras data on mount
  useEffect(() => {
    const fetchData = async () => {
      console.log("Form data:", formData);
      if (!formData?._id || hasFetchedRef.current) return;
    
      try {
        const response = await API.get(`/admissions/${formData._id}`);
        console.log("Raw response:", response);
        console.log("Response data:", response?.data);
        
        const data = response;
        console.log("Fetched Extras data:", data);
    
        if (!data || typeof data !== 'object') {
          notify('Failed to load Extras: No valid data received.', 'info');
          return;
        }
    
        const updatedFormData = {
          ...formData,
          referral: {
            referralSource: data.referralSource || '',
            referralSourceOther: data.referralSourceOther || '',
            referalName: data.referalName || '',
          },
          computerAccess: {
            location: data.computerAccessOther
              ? accessOptions.includes(data.computerAccessOther)
                ? data.computerAccessOther
                : 'Other'
              : '',
            otherLocation: accessOptions.includes(data.computerAccessOther)
              ? ''
              : data.computerAccessOther || '',
          },
          features: {
            tShirt: !!data.tShirt,
            itTools: !!data.itTools,
            webDesigning: !!data.webDesigning,
            tally: !!data.tally,
            gfxDtp: !!data.gfxDtp,
            python: !!data.python,
            iot: !!data.iot,
          },
        };
    
        setFormData(updatedFormData);
        notify('Extras data loaded successfully.', 'success');
        hasFetchedRef.current = true;
      } catch (err) {
        console.error('Failed to fetch Extras data:', err);
        notify('Failed to load previous data for Extras.', 'error');
      }
    };
    

    fetchData();
  }, [formData?._id]);

  // ✅ Flatten and Save on "Next"
  const handleSubmit = async () => {
    const { features, referral, computerAccess } = safeFormData;

    const flattenedData = {
      ...formData,
      currentStep: 'extras',

      // Referral
      referralSource: referral.referralSource,
      referralSourceOther: referral.referralSourceOther,
      referalName: referral.referalName,

      // Computer Access
      computerAccess: !!computerAccess.location,
      computerAccessOther:
        computerAccess.location === 'Other'
          ? computerAccess.otherLocation || ''
          : computerAccess.location || '',

      // Features
      tShirt: features.tShirt,
      itTools: features.itTools,
      webDesigning: features.webDesigning,
      tally: features.tally,
      gfxDtp: features.gfxDtp,
      python: features.python,
      iot: features.iot,
    };

    if (!formData?._id) {
      notify('Form ID missing. Cannot save Extras.', 'error');
      return;
    }

    try {
      setLoading(true);
      await API.put(`/admissions/${formData._id}`, flattenedData);
      notify('Extras saved successfully.', 'success');

      if (typeof onNext === 'function') {
        onNext(flattenedData);
      }
    } catch (err) {
      console.error('Failed to save Extras data:', err);
      notify('Failed to save Extras data.', 'error');
    } finally {
      setLoading(false);
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
          disabled={loading}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Extras;
