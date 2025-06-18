import React, { useState } from 'react';
import { useThemeStore } from '../../store';

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
  boardUniversity: '',
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

const EnquiryForm = () => {
  const { isDarkMode } = useThemeStore();
  const [formData, setFormData] = useState(initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Example: subjects and courses from API (replace with real API calls)
  const subjectsList = [
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
  ];
  const coursesList = [
    { value: 'webdev', label: 'Web Development' },
    { value: 'datasci', label: 'Data Science' },
    { value: 'design', label: 'Design' },
  ];

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
    setSuccess('Enquiry submitted successfully!');
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
          <div>
            <h3 className={sectionTitleClass}>Registration Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Center Code</label>
                <input type="text" name="centerCode" value={formData.centerCode} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Employee ID</label>
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Other Info</label>
                <input type="text" name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Personal Information */}
          <div>
            <h3 className={sectionTitleClass}>Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} required />
                {validationErrors.fullName && <p className={errorClass}>{validationErrors.fullName}</p>}
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="st">ST</option>
                  <option value="sc">SC</option>
                  <option value="obc">OBC</option>
                </select>
              </div>
              <div className="flex items-center space-x-6 col-span-1 sm:col-span-2 mt-2">
                <label className="inline-flex items-center">
                  <input type="radio" name="isExServiceMan" checked={formData.isExServiceMan} onChange={handleInputChange} className={radioCheckClass} />
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ex-ServiceMan</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="isSpeciallyAbled" checked={formData.isSpeciallyAbled} onChange={handleInputChange} className={radioCheckClass} />
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specially Abled</span>
                </label>
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Contact Information */}
          <div>
            <h3 className={sectionTitleClass}>Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Contact Number <span className="text-red-500">*</span></label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className={inputClass} maxLength={10} placeholder="10 digit mobile (WhatsApp)" />
                {validationErrors.contactNumber && <p className={errorClass}>{validationErrors.contactNumber}</p>}
              </div>
              <div>
                <label className={labelClass}>Alternate Contact Number</label>
                <input type="text" name="altContactNumber" value={formData.altContactNumber} onChange={handleInputChange} className={inputClass} maxLength={10} placeholder="Alternate number" />
              </div>
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="example@email.com" />
                {validationErrors.email && <p className={errorClass}>{validationErrors.email}</p>}
              </div>
              <div>
                <label className={labelClass}>Residential Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pin Code</label>
                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className={inputClass} maxLength={6} />
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Educational Information */}
          <div>
            <h3 className={sectionTitleClass}>Educational Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Current Educational Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Board/University</label>
                <input type="text" name="boardUniversity" value={formData.boardUniversity} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year of Passing</label>
                <input type="number" name="passingYear" value={formData.passingYear} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Subjects Studied</label>
                <select name="subjects" multiple value={formData.subjects} onChange={handleInputChange} className={inputClass}>
                  {subjectsList.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Course Preferences */}
          <div>
            <h3 className={sectionTitleClass}>Course Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Interested Course</label>
                <select name="interestedCourse" value={formData.interestedCourse} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Course</option>
                  {coursesList.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Preferred Mode of Learning</label>
                <div className="flex items-center space-x-6 mt-2">
                  <label className="inline-flex items-center">
                    <input type="radio" name="learningMode" value="online" checked={formData.learningMode === 'online'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Online</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="learningMode" value="offline" checked={formData.learningMode === 'offline'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Offline</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Course Level</label>
                <select name="courseLevel" value={formData.courseLevel} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Schedule Preferences */}
          <div>
            <h3 className={sectionTitleClass}>Schedule Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Preferred Batch Time</label>
                <select name="preferredBatchTime" value={formData.preferredBatchTime} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Batch Time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Important Note Related to Time</label>
                <textarea name="timeNote" value={formData.timeNote} onChange={handleInputChange} rows={3} className={inputClass}></textarea>
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Referral Information */}
          <div>
            <h3 className={sectionTitleClass}>Referral Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>Referral Source</label>
                <div className="flex items-center space-x-6 mt-2">
                  <label className="inline-flex items-center">
                    <input type="radio" name="referralSource" value="friend" checked={formData.referralSource === 'friend'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Friend</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="referralSource" value="institution" checked={formData.referralSource === 'institution'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Institution</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="referralSource" value="other" checked={formData.referralSource === 'other'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Other</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Source Name</label>
                <input type="text" name="sourceName" value={formData.sourceName} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Referral Code</label>
                <input type="text" name="referralCode" value={formData.referralCode} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
          </div>
          <hr className={dividerClass} />
          {/* Goals & Requirements */}
          <div>
            <h3 className={sectionTitleClass}>Goals & Requirements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={labelClass}>What are your goals for taking this course?</label>
                <select name="courseGoals" value={formData.courseGoals} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Goal</option>
                  <option value="career">Career Advancement</option>
                  <option value="skill">Skill Development</option>
                  <option value="personal">Personal Interest</option>
                  <option value="academic">Academic Requirements</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Future Goals</label>
                <div className="flex items-center space-x-6 mt-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="futureGoals" value="job" checked={formData.futureGoals.includes('job')} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Get a Job</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="futureGoals" value="business" checked={formData.futureGoals.includes('business')} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start a Business</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="futureGoals" value="higher_education" checked={formData.futureGoals.includes('higher_education')} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Higher Education</span>
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Do you have access to a computer and the necessary software?</label>
                <div className="flex items-center space-x-6 mt-2">
                  <label className="inline-flex items-center">
                    <input type="radio" name="hasComputerAccess" value="yes" checked={formData.hasComputerAccess === 'yes'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="hasComputerAccess" value="no" checked={formData.hasComputerAccess === 'no'} onChange={handleInputChange} className={radioCheckClass} />
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
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