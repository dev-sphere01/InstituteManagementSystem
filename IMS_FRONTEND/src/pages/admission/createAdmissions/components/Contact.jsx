import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/API';
import { toUpper, toTitleCase, toLower } from '../../../../utils/textFormat';

const ALL_INDIAN_STATES = [
  { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Eluru'] },
  { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Tawang', 'Naharlagun', 'Pasighat', 'Ziro', 'Bomdila', 'Tezu'] },
  { name: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon'] },
  { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Chhapra', 'Samastipur'] },
  { name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur'] },
  { name: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
  { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari', 'Morbi', 'Bharuch'] },
  { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Sirsa'] },
  { name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Bilaspur', 'Hamirpur', 'Una'] },
  { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar'] },
  { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Davangere', 'Ballari', 'Kalaburagi', 'Shivamogga', 'Tumakuru'] },
  { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'] },
  { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Burhanpur'] },
  { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'] },
  { name: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul'] },
  { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Cherrapunji'] },
  { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib'] },
  { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'] },
  { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada'] },
  { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar'] },
  { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar'] },
  { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Ravangla'] },
  { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul'] },
  { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda'] },
  { name: 'Tripura', cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Belonia'] },
  { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad', 'Meerut', 'Aligarh', 'Moradabad', 'Bareilly', 'Gorakhpur', 'Jhansi', 'Saharanpur', 'Ayodhya', 'Mathura', 'Firozabad'] },
  { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Pithoragarh'] },
  { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'] },
  { name: 'Andaman and Nicobar Islands', cities: ['Port Blair', 'Diglipur', 'Garacharma'] },
  { name: 'Chandigarh', cities: ['Chandigarh'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman', 'Diu', 'Silvassa'] },
  { name: 'Delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini'] },
  { name: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Sopore'] },
  { name: 'Ladakh', cities: ['Leh', 'Kargil'] },
  { name: 'Lakshadweep', cities: ['Kavaratti', 'Agatti', 'Andrott'] },
  { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] },
];

const Contact = ({ onNext, onBack, validationsEnabled = true, formData = {}, admissionFormid = '' }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [form, setForm] = useState({
    contactNumber: '',
    alternateContactNumber: '',
    emailAddress: '',
    state: '',
    district: '',
    address: '',
    pinCode: '',
    fathersName: '',
    fathersOccupation: '',
    fathersOccupationOther: '',
    fathersJobRole: '',
    fathersDepartmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [availableCities, setAvailableCities] = useState([]);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Sync incoming formData
  useEffect(() => {
    if (formData) {
      setForm((prev) => ({
        ...prev,
        ...formData,
        contactNumber: formData.contactNumber || '',
        alternateContactNumber: formData.alternateContactNumber || '',
        emailAddress: formData.emailAddress || '',
        state: formData.state || '',
        district: formData.district || '',
        address: formData.address || '',
        pinCode: formData.pinCode || '',
        fathersName: formData.fathersName || '',
        fathersOccupation: formData.fathersOccupation || '',
        fathersOccupationOther: formData.fathersOccupationOther || '',
        fathersJobRole: formData.fathersJobRole || '',
        fathersDepartmentOrCompany: formData.fathersDepartmentOrCompany || '',
        mothersName: formData.mothersName || '',
        guardianName: formData.guardianName || '',
        guardianRelation: formData.guardianRelation || '',
        guardianContactNumber: formData.guardianContactNumber || '',
      }));
    }
  }, [formData]);

  // Update available cities when state changes
  useEffect(() => {
    if (form.state) {
      const selected = ALL_INDIAN_STATES.find(
        (s) => s.name.toLowerCase() === form.state.toLowerCase()
      );
      setAvailableCities(selected ? selected.cities : []);
    } else {
      setAvailableCities([]);
    }
  }, [form.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'emailAddress') {
      formattedValue = toLower(value);
    } else if (name === 'address') {
      formattedValue = toTitleCase(value);
    } else if (['contactNumber', 'alternateContactNumber', 'pinCode', 'guardianContactNumber'].includes(name)) {
      formattedValue = value.replace(/\D/g, '');
    } else if ([
      'fathersName', 'mothersName', 'fathersJobRole',
      'fathersDepartmentOrCompany', 'guardianName', 'guardianRelation',
      'fathersOccupationOther'
    ].includes(name)) {
      formattedValue = toUpper(value);
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStateSelect = (stateName) => {
    setForm((prev) => ({
      ...prev,
      state: stateName,
      district: '',
    }));
    setStateSearch(stateName);
    setStateDropdownOpen(false);
    if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
  };

  const handleCitySelect = (cityName) => {
    setForm((prev) => ({ ...prev, district: cityName }));
    setCitySearch(cityName);
    setCityDropdownOpen(false);
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
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

    if (form.fathersOccupation === 'Other' && !form.fathersOccupationOther?.trim()) {
      errs.fathersOccupationOther = 'Please specify father’s occupation';
    }

    if (form.contactNumber && form.contactNumber.length !== 10) {
      errs.contactNumber = 'Contact number must be exactly 10 digits';
    }

    if (form.alternateContactNumber && form.alternateContactNumber.length !== 10) {
      errs.alternateContactNumber = 'Alternate contact must be exactly 10 digits';
    }

    if (form.pinCode && form.pinCode.length !== 6) {
      errs.pinCode = 'Pin Code must be exactly 6 digits';
    }

    if (form.emailAddress?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.emailAddress)) {
        errs.emailAddress = 'Please enter a valid email address';
      }
    }

    if (form.guardianContactNumber && form.guardianContactNumber.length !== 10) {
      errs.guardianContactNumber = 'Guardian contact must be 10 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validationsEnabled && !validate()) {
      notify('Please resolve highlighted errors in Step 2', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...form,
        currentStep: 'contact',
      };

      // If formId exists, perform non-blocking patch
      if (admissionFormid) {
        try {
          await API.patch(`/admissions/${admissionFormid}`, payload);
        } catch (apiErr) {
          console.warn('Direct patch warning in Step 2:', apiErr);
        }
      }

      notify('Contact details saved successfully.', 'success');
      if (typeof onNext === 'function') {
        onNext(payload);
      }
    } catch (err) {
      console.error('Failed to proceed from contact step:', err);
      notify('Failed to save contact details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[field]
      ? 'border-red-500 focus:ring-red-400'
      : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  // Filtered lists for dropdowns
  const filteredStates = ALL_INDIAN_STATES.filter((s) =>
    s.name.toLowerCase().includes((stateSearch || form.state || '').toLowerCase())
  );

  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes((citySearch || form.district || '').toLowerCase())
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
        {/* Contact Number */}
        <div>
          <label className={labelClass}>
            Contact Number {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="contactNumber"
            maxLength={10}
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className={inputClass('contactNumber')}
          />
          {errors.contactNumber && <p className="text-xs text-red-400 mt-1 font-medium">{errors.contactNumber}</p>}
        </div>

        {/* Alternate Contact */}
        <div>
          <label className={labelClass}>Alternate Contact Number</label>
          <input
            type="text"
            name="alternateContactNumber"
            maxLength={10}
            value={form.alternateContactNumber}
            onChange={handleChange}
            placeholder="Optional 10-digit number"
            className={inputClass('alternateContactNumber')}
          />
          {errors.alternateContactNumber && <p className="text-xs text-red-400 mt-1 font-medium">{errors.alternateContactNumber}</p>}
        </div>

        {/* Email Address - Always lowercase */}
        <div>
          <label className={labelClass}>
            Email Address {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            name="emailAddress"
            value={form.emailAddress}
            onChange={handleChange}
            placeholder="student@example.com"
            className={inputClass('emailAddress')}
          />
          {errors.emailAddress && <p className="text-xs text-red-400 mt-1 font-medium">{errors.emailAddress}</p>}
        </div>

        {/* State Dropdown (Searchable + Selectable) */}
        <div className="relative">
          <label className={labelClass}>
            State {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="state"
            value={stateDropdownOpen ? stateSearch : form.state}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setForm((prev) => ({ ...prev, state: e.target.value, district: '' }));
              if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
            }}
            onFocus={() => {
              setStateSearch(form.state || '');
              setStateDropdownOpen(true);
            }}
            onBlur={() => setTimeout(() => setStateDropdownOpen(false), 250)}
            placeholder="Search or select State..."
            autoComplete="off"
            className={inputClass('state')}
          />
          {stateDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto border rounded-lg shadow-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {filteredStates.length > 0 ? (
                filteredStates.map((st, i) => (
                  <div
                    key={i}
                    onMouseDown={() => handleStateSelect(st.name)}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 font-medium"
                  >
                    {st.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                  No matching state (press Tab or enter custom state)
                </div>
              )}
            </div>
          )}
          {errors.state && <p className="text-xs text-red-400 mt-1 font-medium">{errors.state}</p>}
        </div>

        {/* City / District Dropdown */}
        <div className="relative">
          <label className={labelClass}>
            City / District {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="district"
            value={cityDropdownOpen ? citySearch : form.district}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setForm((prev) => ({ ...prev, district: e.target.value }));
              if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
            }}
            onFocus={() => {
              setCitySearch(form.district || '');
              setCityDropdownOpen(true);
            }}
            onBlur={() => setTimeout(() => setCityDropdownOpen(false), 250)}
            placeholder={form.state ? 'Search or select City...' : 'Select State first'}
            disabled={!form.state}
            autoComplete="off"
            className={inputClass('district')}
          />
          {cityDropdownOpen && form.state && (
            <div className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto border rounded-lg shadow-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {filteredCities.length > 0 ? (
                filteredCities.map((ct, i) => (
                  <div
                    key={i}
                    onMouseDown={() => handleCitySelect(ct)}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 font-medium"
                  >
                    {ct}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                  Type custom city name if not listed above
                </div>
              )}
            </div>
          )}
          {errors.district && <p className="text-xs text-red-400 mt-1 font-medium">{errors.district}</p>}
        </div>

        {/* Pin Code */}
        <div>
          <label className={labelClass}>
            Pin Code {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="pinCode"
            maxLength={6}
            value={form.pinCode}
            onChange={handleChange}
            placeholder="6-digit pin code"
            className={inputClass('pinCode')}
          />
          {errors.pinCode && <p className="text-xs text-red-400 mt-1 font-medium">{errors.pinCode}</p>}
        </div>

        {/* Address - Always Title Case */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelClass}>
            Address (Title Case) {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name="address"
            rows={2}
            value={form.address}
            onChange={handleChange}
            placeholder="Flat/House No., Street, Landmark..."
            className={`${inputClass('address')} resize-none`}
          />
          {errors.address && <p className="text-xs text-red-400 mt-1 font-medium">{errors.address}</p>}
        </div>

        {/* Father's Name */}
        <div>
          <label className={labelClass}>
            Father's Name {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="fathersName"
            value={form.fathersName}
            onChange={handleChange}
            placeholder="FATHER'S FULL NAME"
            className={inputClass('fathersName')}
          />
          {errors.fathersName && <p className="text-xs text-red-400 mt-1 font-medium">{errors.fathersName}</p>}
        </div>

        {/* Father's Occupation - Dropdown with Other */}
        <div>
          <label className={labelClass}>
            Father's Occupation {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            name="fathersOccupation"
            value={form.fathersOccupation}
            onChange={handleChange}
            className={inputClass('fathersOccupation')}
          >
            <option value="">Select Occupation</option>
            <option value="Private">Private Sector</option>
            <option value="Government">Government / Public Sector</option>
            <option value="Business">Business / Self-Employed</option>
            <option value="Agriculture">Agriculture / Farming</option>
            <option value="Other">Other</option>
          </select>
          {errors.fathersOccupation && <p className="text-xs text-red-400 mt-1 font-medium">{errors.fathersOccupation}</p>}
        </div>

        {/* Specify Other Occupation */}
        {form.fathersOccupation === 'Other' && (
          <div>
            <label className={labelClass}>
              Specify Father's Occupation {validationsEnabled && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="fathersOccupationOther"
              value={form.fathersOccupationOther}
              onChange={handleChange}
              placeholder="E.G. ARCHITECT, CONSULTANT"
              className={inputClass('fathersOccupationOther')}
            />
            {errors.fathersOccupationOther && <p className="text-xs text-red-400 mt-1 font-medium">{errors.fathersOccupationOther}</p>}
          </div>
        )}

        {/* Father's Job Role - OPTIONAL */}
        <div>
          <label className={labelClass}>
            Father's Job Role <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="fathersJobRole"
            value={form.fathersJobRole}
            onChange={handleChange}
            placeholder="E.G. SENIOR MANAGER"
            className={inputClass('fathersJobRole')}
          />
        </div>

        {/* Department / Company - OPTIONAL */}
        <div>
          <label className={labelClass}>
            Father's Department / Company <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="fathersDepartmentOrCompany"
            value={form.fathersDepartmentOrCompany}
            onChange={handleChange}
            placeholder="E.G. OPERATIONS / TECH CORP"
            className={inputClass('fathersDepartmentOrCompany')}
          />
        </div>

        {/* Mother's Name */}
        <div>
          <label className={labelClass}>
            Mother's Name {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="mothersName"
            value={form.mothersName}
            onChange={handleChange}
            placeholder="MOTHER'S FULL NAME"
            className={inputClass('mothersName')}
          />
          {errors.mothersName && <p className="text-xs text-red-400 mt-1 font-medium">{errors.mothersName}</p>}
        </div>

        {/* Guardian's Name */}
        <div>
          <label className={labelClass}>
            Guardian's Name <span className="text-xs text-gray-400 font-normal">(If applicable)</span>
          </label>
          <input
            type="text"
            name="guardianName"
            value={form.guardianName}
            onChange={handleChange}
            placeholder="GUARDIAN FULL NAME"
            className={inputClass('guardianName')}
          />
        </div>

        {/* Guardian's Relation */}
        <div>
          <label className={labelClass}>
            Guardian's Relation <span className="text-xs text-gray-400 font-normal">(If applicable)</span>
          </label>
          <input
            type="text"
            name="guardianRelation"
            value={form.guardianRelation}
            onChange={handleChange}
            placeholder="E.G. UNCLE, AUNT"
            className={inputClass('guardianRelation')}
          />
        </div>

        {/* Guardian's Contact Number */}
        <div>
          <label className={labelClass}>
            Guardian's Contact Number <span className="text-xs text-gray-400 font-normal">(If applicable)</span>
          </label>
          <input
            type="text"
            name="guardianContactNumber"
            maxLength={10}
            value={form.guardianContactNumber}
            onChange={handleChange}
            placeholder="10-digit number"
            className={inputClass('guardianContactNumber')}
          />
          {errors.guardianContactNumber && <p className="text-xs text-red-400 mt-1 font-medium">{errors.guardianContactNumber}</p>}
        </div>
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
