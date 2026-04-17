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
    fathersDepartmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
          const normalizedStates = indiaData.states.map((state) => ({
            name: state.stateName || state.name,
            cities: (state.cityNames || state.cities || []).map((city) => ({
              name: city.name || city
            }))
          }));
          setStatesData(normalizedStates);
          console.log("States from array:", normalizedStates);
        }
      } else if (countryData?.states) {
        // Single country object
        const normalizedStates = countryData.states.map((state) => ({
          name: state.stateName || state.name,
          cities: (state.cityNames || state.cities || []).map((city) => ({
            name: city.name || city
          }))
        }));
        setStatesData(normalizedStates);
        console.log("States from single object:", normalizedStates);
      }
    } catch (error) {
      console.error("Failed to fetch country, states, and cities", error);
    }
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

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

    // Basic email validation
    if (form.emailAddress?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.emailAddress)) {
        errs.emailAddress = 'Please enter a valid email address';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please fill all required contact fields correctly.', 'error');
    }
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    }`;

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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleStateSelect(state);
                  }}
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
        {/* Click outside to close dropdown */}
        {stateDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setStateDropdownOpen(false)}
          />
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCitySelect(city);
                  }}
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
        {/* Click outside to close dropdown */}
        {cityDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setCityDropdownOpen(false)}
          />
        )}
      </div>
      {errors.district && <p className="text-xs text-red-400 mt-1 font-medium">{errors.district}</p>}
    </div>
  );

  return (
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
        {renderInput({ label: 'Contact Number', name: 'contactNumber', required: true })}
        {renderInput({ label: 'Alternate Contact Number', name: 'alternateContactNumber' })}
        {renderInput({ label: 'Email Address', name: 'emailAddress', required: true, type: 'email' })}
        {renderStateDropdown()}
        {renderCityDropdown()}
        {renderInput({ label: 'Pin Code', name: 'pinCode', required: true })}
        <div className="sm:col-span-2 lg:col-span-3">
          {renderInput({ label: 'Address', name: 'address', required: true, isTextArea: true })}
        </div>
        {renderInput({ label: "Father's Name", name: 'fathersName', required: true })}
        {renderInput({ label: "Father's Occupation", name: 'fathersOccupation', required: true })}
        {renderInput({ label: "Father's Job Role", name: 'fathersJobRole' })}
        {renderInput({ label: 'Department/Company', name: 'fathersDepartmentOrCompany' })}
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
  );
};

export default Contact;
