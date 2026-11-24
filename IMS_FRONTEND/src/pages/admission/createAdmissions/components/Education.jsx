import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';
import {
  QUALIFICATIONS,
  BOARDS_AND_UNIVERSITIES,
  SUBJECT_OPTIONS,
  getPassingYears
} from '../../../../constants/educationOptions';
import { toUpper } from '../../../../utils/textFormat';

const Education = ({ formId, formData = {}, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const passingYears = getPassingYears();

  // Local state for 'Other' triggers
  const [isOtherQualification, setIsOtherQualification] = useState(false);
  const [isOtherBoard, setIsOtherBoard] = useState(false);
  const [isOtherSubject, setIsOtherSubject] = useState(false);
  const [isOtherYear, setIsOtherYear] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get('/courses?limit=1000');
        if (response && response.success) {
          setCourses(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();

    // Check if initial values are 'Other' or custom
    if (formData.highestEducationalQualification && !QUALIFICATIONS.includes(formData.highestEducationalQualification)) {
      setIsOtherQualification(true);
    }
    if (formData.boardOrUniversity && !BOARDS_AND_UNIVERSITIES.includes(formData.boardOrUniversity)) {
      setIsOtherBoard(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDropdownWithOther = (fieldName, selectedValue, setOtherFlag) => {
    if (selectedValue === 'Other') {
      setOtherFlag(true);
      setFormData((prev) => ({ ...prev, [fieldName]: '' }));
    } else {
      setOtherFlag(false);
      setFormData((prev) => ({ ...prev, [fieldName]: selectedValue }));
    }
    if (errors[fieldName]) setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const validate = () => {
    if (!validationsEnabled) {
      setErrors({});
      return true;
    }

    const requiredFields = [
      'highestEducationalQualification',
      'boardOrUniversity',
      'yearOfPassing',
      'subjectsStudied',
      'courseApplied',
      'preferredModeOfLearning',
    ];

    const errs = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) errs[field] = 'Required';
    });

    const currentYear = new Date().getFullYear();
    if (formData.yearOfPassing && Number(formData.yearOfPassing) > currentYear) {
      errs.yearOfPassing = `Cannot be greater than ${currentYear}`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (validationsEnabled && !validate()) return;

    setLoading(true);
    try {
      const subjectsArray = formData.subjectsStudied
        ? Array.isArray(formData.subjectsStudied)
          ? formData.subjectsStudied
          : formData.subjectsStudied
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

      const payload = {
        ...formData,
        subjectsStudied: subjectsArray,
      };

      if (typeof onNext === 'function') {
        await onNext(payload);
        notify('Education details saved successfully.', 'success');
      }
    } catch (error) {
      console.error('Failed to save education step:', error);
      notify('Failed to save education details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

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
        Step 3: Education &amp; Course Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Highest Educational Qualification */}
        <div>
          <label className={labelClass}>
            Highest Qualification {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            value={isOtherQualification ? 'Other' : formData.highestEducationalQualification || ''}
            onChange={(e) => handleDropdownWithOther('highestEducationalQualification', e.target.value, setIsOtherQualification)}
            className={inputClass('highestEducationalQualification')}
          >
            <option value="">Select Qualification</option>
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          {isOtherQualification && (
            <input
              type="text"
              name="highestEducationalQualification"
              value={formData.highestEducationalQualification || ''}
              onChange={(e) => handleChange({ target: { name: 'highestEducationalQualification', value: toUpper(e.target.value) } })}
              placeholder="Specify qualification..."
              className={`${inputClass('highestEducationalQualification')} mt-2`}
            />
          )}
          {errors.highestEducationalQualification && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.highestEducationalQualification}</p>
          )}
        </div>

        {/* Board / University */}
        <div>
          <label className={labelClass}>
            Board / University {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            value={isOtherBoard ? 'Other' : formData.boardOrUniversity || ''}
            onChange={(e) => handleDropdownWithOther('boardOrUniversity', e.target.value, setIsOtherBoard)}
            className={inputClass('boardOrUniversity')}
          >
            <option value="">Select Board / University</option>
            {BOARDS_AND_UNIVERSITIES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {isOtherBoard && (
            <input
              type="text"
              name="boardOrUniversity"
              value={formData.boardOrUniversity || ''}
              onChange={(e) => handleChange({ target: { name: 'boardOrUniversity', value: toUpper(e.target.value) } })}
              placeholder="Specify Board / University..."
              className={`${inputClass('boardOrUniversity')} mt-2`}
            />
          )}
          {errors.boardOrUniversity && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.boardOrUniversity}</p>
          )}
        </div>

        {/* Year of Passing */}
        <div>
          <label className={labelClass}>
            Year of Passing {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            value={isOtherYear ? 'Other' : formData.yearOfPassing?.toString() || ''}
            onChange={(e) => handleDropdownWithOther('yearOfPassing', e.target.value, setIsOtherYear)}
            className={inputClass('yearOfPassing')}
          >
            <option value="">Select Year</option>
            {passingYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          {isOtherYear && (
            <input
              type="number"
              name="yearOfPassing"
              value={formData.yearOfPassing || ''}
              onChange={handleChange}
              placeholder="Enter Year (e.g. 1978)..."
              className={`${inputClass('yearOfPassing')} mt-2`}
            />
          )}
          {errors.yearOfPassing && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.yearOfPassing}</p>
          )}
        </div>

        {/* Subjects Studied */}
        <div>
          <label className={labelClass}>
            Subjects Studied {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            value={
              isOtherSubject
                ? 'Other'
                : Array.isArray(formData.subjectsStudied)
                ? formData.subjectsStudied.join(', ')
                : formData.subjectsStudied || ''
            }
            onChange={(e) => handleDropdownWithOther('subjectsStudied', e.target.value, setIsOtherSubject)}
            className={inputClass('subjectsStudied')}
          >
            <option value="">Select Subjects</option>
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          {isOtherSubject && (
            <input
              type="text"
              name="subjectsStudied"
              value={
                Array.isArray(formData.subjectsStudied)
                  ? formData.subjectsStudied.join(', ')
                  : formData.subjectsStudied || ''
              }
              onChange={(e) => handleChange({ target: { name: 'subjectsStudied', value: toUpper(e.target.value) } })}
              placeholder="e.g. Mathematics, Statistics, Computing"
              className={`${inputClass('subjectsStudied')} mt-2`}
            />
          )}
          {errors.subjectsStudied && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.subjectsStudied}</p>
          )}
        </div>

        {/* Course Applied */}
        <div>
          <label className={labelClass}>
            Course Applied {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            name="courseApplied"
            value={formData.courseApplied || ''}
            onChange={handleChange}
            className={inputClass('courseApplied')}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course.courseName}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
          {errors.courseApplied && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.courseApplied}</p>
          )}
        </div>

        {/* Preferred Mode of Learning */}
        <div>
          <label className={labelClass}>
            Preferred Mode of Learning {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <select
            name="preferredModeOfLearning"
            value={formData.preferredModeOfLearning || ''}
            onChange={handleChange}
            className={inputClass('preferredModeOfLearning')}
          >
            <option value="">Select Mode</option>
            <option value="offline">Offline (Classroom)</option>
            <option value="online">Online (Remote)</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.preferredModeOfLearning && (
            <p className="text-xs text-red-400 mt-1 font-medium">{errors.preferredModeOfLearning}</p>
          )}
        </div>
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
          onClick={handleNext}
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

export default Education;
