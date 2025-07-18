import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/API';

const Contact = ({ onNext, onBack, validationsEnabled = true, formData = {}, admissionFormid = '' }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState({
    contactNumber: '',
    alternateContactNumber: '',
    emailAddress: '',
    state: '',
    district: '', // This will be renamed to city
    address: '',
    pinCode: '',
    fathersName: '',
    fathersOccupation: '',
    fathersJobRole: '',
    departmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP related states
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // States and cities data
  const [statesData, setStatesData] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  
  // Dropdown states
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    fetchStatesAndCities();
  }, []);

  // Fetching states and cities
  const fetchStatesAndCities = async () => {
    try {
      const res = await API.get('/country-state-city');
      console.log("Full API Response:", res);
      
      // Handle different possible response structures
      let countryData;
      if (res?.data) {
        countryData = res.data;
      } else if (res) {
        countryData = res;
      }
      
      console.log("Country Data:", countryData);
      
      // Check if countryData is an array (multiple countries) or single object
      if (Array.isArray(countryData)) {
        // If it's an array, get the first country (assuming India)
        const indiaData = countryData.find(country => 
          country.countryName === 'India' || country.name === 'India'
        ) || countryData[0];
        
        if (indiaData?.states) {
          setStatesData(indiaData.states);
          console.log("States from array:", indiaData.states);
        }
      } else if (countryData?.states) {
        // Single country object
        setStatesData(countryData.states);
        console.log("States from single object:", countryData.states);
      }
    } catch (error) {
      console.error("Failed to fetch country, states, and cities", error);
    }
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Filter states based on search
  const filteredStates = statesData.filter(state =>
    state.name && state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter cities based on search
  const filteredCities = availableCities.filter(city =>
    city.name && city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Handle state selection
  const handleStateSelect = (selectedState) => {
    setForm(prev => ({ 
      ...prev, 
      state: selectedState.name,
      district: '' // Reset city when state changes
    }));
    setAvailableCities(selectedState.cities || []);
    setStateSearch('');
    setStateDropdownOpen(false);
    setCitySearch('');
    
    // Clear state error if exists
    if (errors.state) {
      setErrors(prev => ({ ...prev, state: '' }));
    }
  };

  // Handle city selection
  const handleCitySelect = (selectedCity) => {
    setForm(prev => ({ ...prev, district: selectedCity.name }));
    setCitySearch('');
    setCityDropdownOpen(false);
    
    // Clear city error if exists
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }));
    }
  };

  const validate = () => {
    if (!validationsEnabled) {
      setErrors({});
      return true;
    }

    const requiredFields = [
      'contactNumber',
      'emailAddress',
      'state',
      'district',
      'address',
      'pinCode',
      'fathersName',
      'fathersOccupation',
      'mothersName',
    ];

    const errs = {};
    requiredFields.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = 'Required';
    });

    // Email verification check
    if (validationsEnabled && !emailVerified && form.emailAddress?.trim()) {
      errs.emailAddress = 'Email verification required';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please fill all required contact fields and verify your email.', 'error');
    }
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    // Reset email verification if email is changed
    if (name === 'emailAddress' && emailVerified) {
      setEmailVerified(false);
    }
  };

  const handleSendOtp = async () => {
    if (!form.emailAddress?.trim()) {
      notify('Please enter email address first', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.emailAddress)) {
      notify('Please enter a valid email address', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await API.post('/email/send-otp', {
        email: form.emailAddress,
        formid: admissionFormid,
      });

      if (response.ok) {
        setOtpModal(true);
        setResendTimer(120);
        notify('OTP sent successfully to your email', 'success');
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      notify('Failed to send OTP. Please try again.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      notify('Please enter OTP', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await API.post('/email/verify-otp', {
        email: form.emailAddress,
        otp: otp,
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setEmailVerified(true);
        setOtpModal(false);
        setOtp('');
        notify('Email verified successfully!', 'success');
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      notify(error.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(120);
    await handleSendOtp();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (typeof onNext === 'function') {
        await onNext(form);
        notify('Contact details saved successfully.', 'success');
      }
    } catch (err) {
      console.error('Error saving contact details:', err);
      notify('Failed to save contact details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors[field]
      ? 'border-red-500 focus:ring-red-400'
      : isDarkMode
        ? 'border-gray-700 bg-[#23272f] text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    } ${field === 'emailAddress' && emailVerified ? 'bg-green-50 border-green-300' : ''}`;

  const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`;

  const dropdownClass = `absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto border rounded-lg shadow-lg z-50 ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-600' 
      : 'bg-white border-gray-300'
  }`;

  const dropdownItemClass = `px-4 py-2 cursor-pointer transition-colors duration-150 ${
    isDarkMode
      ? 'hover:bg-gray-700 text-white'
      : 'hover:bg-gray-100 text-gray-900'
  }`;

  const renderInput = ({ label, name, required = false, type = 'text', isTextArea = false }) => (
    <div>
      <label className={labelClass}>
        {label} {required && validationsEnabled && <span className="text-red-500">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          rows="3"
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`${inputClass(name)} resize-none`}
        />
      ) : (
        <input  
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={inputClass(name)}
          disabled={name === 'emailAddress' && emailVerified}
        />
      )}
      {errors[name] && <p className="text-xs text-red-400 mt-1 font-medium">{errors[name]}</p>}
    </div>
  );

  const renderStateDropdown = () => (
    <div className="relative">
      <label className={labelClass}>
        State <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={stateDropdownOpen ? stateSearch : form.state}
          onChange={(e) => setStateSearch(e.target.value)}
          onFocus={() => setStateDropdownOpen(true)}
          onBlur={() => setTimeout(() => setStateDropdownOpen(false), 200)}
          placeholder="Search and select state..."
          className={inputClass('state')}
        />
        {stateDropdownOpen && (
          <div className={dropdownClass}>
            {statesData.length === 0 ? (
              <div className={`px-4 py-2 text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading states...
              </div>
            ) : filteredStates.length > 0 ? (
              filteredStates.map((state, index) => (
                <div
                  key={index}
                  className={dropdownItemClass}
                  onClick={() => handleStateSelect(state)}
                >
                  {state.name}
                </div>
              ))
            ) : (
              <div className={`px-4 py-2 text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No states found
              </div>
            )}
          </div>
        )}
      </div>
      {errors.state && <p className="text-xs text-red-400 mt-1 font-medium">{errors.state}</p>}
    </div>
  );

  const renderCityDropdown = () => (
    <div className="relative">
      <label className={labelClass}>
        City <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={cityDropdownOpen ? citySearch : form.district}
          onChange={(e) => setCitySearch(e.target.value)}
          onFocus={() => setCityDropdownOpen(true)}
          onBlur={() => setTimeout(() => setCityDropdownOpen(false), 200)}
          placeholder={form.state ? "Search and select city..." : "Select state first"}
          className={inputClass('district')}
          disabled={!form.state}
        />
        {cityDropdownOpen && form.state && (
          <div className={dropdownClass}>
            {availableCities.length === 0 ? (
              <div className={`px-4 py-2 text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No cities available for this state
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city, index) => (
                <div
                  key={index}
                  className={dropdownItemClass}
                  onClick={() => handleCitySelect(city)}
                >
                  {city.name}
                </div>
              ))
            ) : (
              <div className={`px-4 py-2 text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No cities found
              </div>
            )}
          </div>
        )}
      </div>
      {errors.district && <p className="text-xs text-red-400 mt-1 font-medium">{errors.district}</p>}
    </div>
  );

  const renderEmailInput = () => (
    <div>
      <label className={labelClass}>
        Email Address <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          name="emailAddress"
          value={form.emailAddress}
          onChange={handleChange}
          className={inputClass('emailAddress')}
          disabled={emailVerified}
        />
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sendingOtp || emailVerified}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${emailVerified
            ? 'bg-green-500 text-white cursor-not-allowed'
            : sendingOtp
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {emailVerified ? 'Verified' : sendingOtp ? 'Sending...' : 'Send OTP'}
        </button>
      </div>
      {errors.emailAddress && <p className="text-xs text-red-400 mt-1 font-medium">{errors.emailAddress}</p>}
    </div>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
          }`}
      >
        <h2 className={`text-2xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
          Step 2: Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderInput({ label: 'Contact Number', name: 'contactNumber', required: true,type:'number' })}
          {renderInput({ label: 'Alternate Contact Number', name: 'alternateContactNumber',type:'number' })}
          {renderEmailInput()}
          {renderStateDropdown()}
          {renderCityDropdown()}
          {renderInput({ label: 'Pin Code', name: 'pinCode', required: true })}
          <div className="sm:col-span-2 lg:col-span-3">
            {renderInput({ label: 'Address', name: 'address', required: true, isTextArea: true })}
          </div>
          {renderInput({ label: "Father's Name", name: 'fathersName', required: true })}
          {renderInput({ label: "Father's Occupation", name: 'fathersOccupation', required: true })}
          {renderInput({ label: "Father's Job Role", name: 'fathersJobRole' })}
          {renderInput({ label: 'Department/Company', name: 'departmentOrCompany' })}
          {renderInput({ label: "Mother's Name", name: 'mothersName', required: true })}
          {renderInput({ label: "Guardian's Name", name: 'guardianName' })}
          {renderInput({ label: "Guardian's Relation", name: 'guardianRelation' })}
          {renderInput({ label: "Guardian's Contact Number", name: 'guardianContactNumber' })}
        </div>

        <div className="flex items-center justify-between pt-8 border-t mt-8 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode
              ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
              : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
              }`}
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
              }`}
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            <h3 className="text-lg font-semibold mb-4">Verify Email</h3>
            <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
              Enter the OTP sent to {form.emailAddress}
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className={`w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              maxLength={6}
            />

            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className={`text-sm ${resendTimer > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:text-blue-600 cursor-pointer'
                  }`}
              >
                {resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : 'Resend OTP'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOtpModal(false);
                  setOtp('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || !otp.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-all duration-200 ${otpLoading || !otp.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {otpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;