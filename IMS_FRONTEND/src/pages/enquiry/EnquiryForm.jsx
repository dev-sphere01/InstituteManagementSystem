import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../../store';
import { useNotification } from '../../services/NotificationService';

// Form section imports
import Registration from './components/Registration';
import Personal from './components/Personal';
import Contact from './components/Contact';
import Educational from './components/Educational';
import CoursePref from './components/CoursePref';
import { SchedulePref } from './components/SchedulePref';
import Referral from './components/Referral';
import GoalsAndReq from './components/GoalsAndReq';

const initialState = {
  // Registration Information
  centerCode: '',
  employeeId: '',
  otherInfo: '',
  // Personal Information
  fullName: '',
  dob: '',
  gender: '',
  category: '',
  isExServiceMan: false,
  isSpeciallyAbled: false,
  // Contact
  contactNumber: '',
  altContactNumber: '',
  email: '',
  address: '',
  pinCode: '',
  // Education
  qualification: '',
  board: '',
  university: '',
  passingYear: '',
  subjects: [],
  // Course Preferences
  interestedCourse: '',
  learningMode: '',
  courseLevel: '',
  // Schedule Preferences
  preferredBatchTime: '',
  timeNote: '',
  // Referral Information
  referralSource: '',
  sourceName: '',
  referralCode: '',
  // Goals & Requirements
  courseGoals: '',
  futureGoals: [],
  hasComputerAccess: '',
};

const boardOptions = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'icse', label: 'ICSE' },
  { value: 'state', label: 'State Board' },
];
const universityOptions = [
  { value: 'delhi', label: 'Delhi University' },
  { value: 'mumbai', label: 'Mumbai University' },
  { value: 'bangalore', label: 'Bangalore University' },
];

const subjectsList = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'computer', label: 'Computer Science' },
];
const coursesList = [
  { value: 'webdev', label: 'Web Development' },
  { value: 'datasci', label: 'Data Science' },
  { value: 'design', label: 'Design' },
];

function SearchableDropdown({ options, value, onChange, placeholder, isMulti = false }) {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);
  const ref = useRef();
  const filtered = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));

  // Click-away listener
  useEffect(() => {
    if (!show) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const handleSelect = (val) => {
    if (isMulti) {
      if (value.includes(val)) {
        onChange(value.filter(v => v !== val));
      } else {
        onChange([...value, val]);
      }
    } else {
      onChange(val);
      setShow(false);
    }
  };

  // Style for input and dropdown to match form
  const inputBox =
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400';
  const dropdownBox =
    'absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto';

  return (
    <div className="relative" ref={ref} style={{ minWidth: 0 }}>
      <div
        className={inputBox + ' flex items-center cursor-pointer'}
        style={{ minHeight: '42px' }}
        onClick={() => setShow(s => !s)}
      >
        <input
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          style={{ minWidth: 0 }}
          placeholder={placeholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onClick={e => { e.stopPropagation(); setShow(true); }}
        />
        <span className="ml-2 text-gray-400">▼</span>
      </div>
      {show && (
        <div className={dropdownBox}>
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-gray-400">No options</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt.value}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 ${(isMulti ? value.includes(opt.value) : value === opt.value)
                ? 'bg-blue-50 dark:bg-gray-800 font-semibold' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
              {isMulti && value.includes(opt.value) && <span className="ml-2 text-blue-500">✔</span>}
            </div>
          ))}
        </div>
      )}
      {isMulti && value.length > 0 && (
        <div className="flex flex-wrap mt-1">
          {value.map(val => {
            const opt = options.find(o => o.value === val);
            return (
              <span key={val} className="mr-2 mb-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
                {opt ? opt.label : val}
                <button type="button" className="ml-1 text-blue-500" onClick={() => handleSelect(val)}>×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

const EnquiryForm = () => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [formData, setFormData] = useState(initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [eduType, setEduType] = useState('board'); // 'board' or 'university'

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'futureGoals') {
      setFormData((prev) => {
        const arr = prev.futureGoals.includes(value)
          ? prev.futureGoals.filter((v) => v !== value)
          : [...prev.futureGoals, value];
        return { ...prev, futureGoals: arr };
      });
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'select-multiple') {
      const options = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: options }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // For custom dropdowns
  const handleBoardChange = (val) => {
    setFormData(prev => ({ ...prev, board: val, university: '' }));
  };
  const handleUniversityChange = (val) => {
    setFormData(prev => ({ ...prev, university: val, board: '' }));
  };
  const handleSubjectsChange = (vals) => {
    setFormData(prev => ({ ...prev, subjects: vals }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.contactNumber.trim() || !/^\d{10}$/.test(formData.contactNumber)) errors.contactNumber = 'Valid 10-digit contact number is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Valid email address is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validateForm()) return;
    notify('Enquiry submitted successfully!', 'success');
    setFormData(initialState);
  };

  // Theme-based classes
  const cardClass = `rounded-lg shadow-md p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const formTitleClass = `text-3xl font-bold  bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600`;
  const formSubtitleClass = `mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
  const sectionTitleClass = `text-base font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`;
  const errorClass = 'mt-1 text-sm text-red-500';
  const radioCheckClass = `h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded`;
  const buttonClass = `px-6 py-2 rounded-md font-semibold transition-colors duration-150 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
  const resetButtonClass = `px-4 py-2 border rounded-md font-medium transition-colors duration-150 shadow ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`;
  const dividerClass = `my-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`;
  const toggleBtnClass = (active) => `h-full px-3 py-1 text-sm rounded-l-md border border-r-0 font-medium focus:outline-none transition-colors duration-100 ${active ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`;
  const toggleBtnClassRight = (active) => `h-full px-3 py-2 text-sm rounded-r-md border font-medium focus:outline-none transition-colors duration-100 ${active ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`;

  return (
    <div className="p-0">
      <div className={cardClass}>
        {/* Form Title & Subtitle */}
        <div className="mb-6">
          <h2 className={formTitleClass}>Add Enquiry</h2>
          <p className={formSubtitleClass}>Fill out the form to submit a new enquiry.</p>
        </div>
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <div className="flex items-center"><span className="mr-2">✅</span>{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex items-center"><span className="mr-2">❌</span>{error}</div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Registration Information */}
          <Registration
            formData={formData}
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            handleInputChange={handleInputChange}
            inputClass={inputClass} />

          <hr className={dividerClass} />

          {/* Personal Information */}
          <Personal
            sectionTitleClas={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            errorClass={errorClass}
            inputClass={inputClass}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
            radioCheckClass={radioCheckClass}
            isDarkMode={isDarkMode} />

          <hr className={dividerClass} />

          {/* Contact Information */}
          <Contact
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            inputClass={inputClass}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
            errorClass={errorClass} />

          <hr className={dividerClass} />

          {/* Educational Information */}
          <Educational
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            inputClass={inputClass}
            handleInputChange={handleInputChange}
            toggleBtnClass={toggleBtnClass}
            eduType={eduType}
            toggleBtnClassRight={toggleBtnClassRight}
            setEduType={setEduType}
            SearchableDropdown={SearchableDropdown}
            boardOptions={boardOptions}
            handleBoardChange={handleBoardChange}
            universityOptions={universityOptions}
            handleUniversityChange={handleUniversityChange}
            subjectsList={subjectsList}
            handleSubjectsChange={handleSubjectsChange} />

          <hr className={dividerClass} />

          {/* Course Preferences */}
          <CoursePref
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            handleInputChange={handleInputChange}
            inputClass={inputClass}
            coursesList={coursesList}
            radioCheckClass={radioCheckClass}
            isDarkMode={isDarkMode} />

          <hr className={dividerClass} />

          {/* Schedule Preferences */}
          <SchedulePref
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            handleInputChange={handleInputChange}
            inputClass={inputClass} />

          <hr className={dividerClass} />

          {/* Referral Information */}
          <Referral
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            inputClass={inputClass}
            handleInputChange={handleInputChange}
            radioCheckClass={radioCheckClass}
            isDarkMode={isDarkMode}
          />

          <hr className={dividerClass} />

          {/* Goals & Requirements */}
          <GoalsAndReq
            sectionTitleClass={sectionTitleClass}
            labelClass={labelClass}
            formData={formData}
            handleInputChange={handleInputChange}
            inputClass={inputClass}
            radioCheckClass={radioCheckClass}
            isDarkMode={isDarkMode}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button type="button" onClick={() => { setFormData(initialState); setValidationErrors({}); setSuccess(''); setError(''); }} className={resetButtonClass}>Reset</button>
            <button type="submit" className={buttonClass}>Submit Enquiry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnquiryForm;