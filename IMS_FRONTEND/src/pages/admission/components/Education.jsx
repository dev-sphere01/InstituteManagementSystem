import React from 'react';
import { getAdmissionStyleClasses } from '../styleClasses';
import { useThemeStore } from '../../../store';

const Education = ({ formData, setFormData, nextStep, prevStep }) => {
  const { isDarkMode } = useThemeStore();
  const { cardClass, sectionTitleClass, labelClass, inputClass, buttonClass, prevButtonClass, clearButtonClass } = getAdmissionStyleClasses();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const radioCheckClass = `form-checkbox h-5 w-5 ${isDarkMode ? 'text-purple-500 bg-gray-700 border-gray-600' : 'text-purple-600 border-gray-300'} focus:ring-purple-500`;

  return (
    <div className={cardClass}>
      <div className="mb-6">
        <h3 className={sectionTitleClass}>Educational Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Highest Educational Qualification*</label>
            <select name="highestEducationalQualification" value={formData.highestEducationalQualification || ''} onChange={handleChange} className={inputClass}>
              <option>Select Qualification</option>
              {/* Add qualification options here */}
            </select>
          </div>
          <div>
            <label className={labelClass}>Board/University*</label>
            <input type="text" name="boardOrUniversity" value={formData.boardOrUniversity || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Year of Passing*</label>
            <input type="text" name="yearOfPassing" value={formData.yearOfPassing || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subjects Studied*</label>
            <input type="text" name="subjectsStudied" value={formData.subjectsStudied || ''} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <div>
        <h3 className={sectionTitleClass}>Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Course Applied For*</label>
            <select name="courseApplied" value={formData.courseApplied || ''} onChange={handleChange} className={inputClass}>
              <option>Select Course</option>
              {/* Add course options here */}
            </select>
          </div>
          <div>
            <label className={labelClass}>Preferred Mode of Learning*</label>
            <select name="preferredModeOfLearning" value={formData.preferredModeOfLearning || ''} onChange={handleChange} className={inputClass}>
              <option>Select Mode</option>
              {/* Add mode options here */}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Additional Courses*</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {['tShirt', 'itTools', 'webDesigning', 'tally', 'gfxDtp', 'python', 'iot'].map(course => (
                <label key={course} className="inline-flex items-center">
                  <input type="checkbox" name={course} checked={formData[course] || false} onChange={handleChange} className={radioCheckClass} />
                  <span className="ml-2 text-sm">{course.charAt(0).toUpperCase() + course.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>How did you hear about us?*</label>
            <select name="referralSource" value={formData.referralSource || ''} onChange={handleChange} className={inputClass}>
                <option>Select Source</option>
                {/* Add source options here */}
            </select>
          </div>
           <div>
            <label className={labelClass}>Referral Name (if any)</label>
            <input type="text" name="referralName" value={formData.referralName || ''} onChange={handleChange} className={inputClass} />
          </div>
           <div className="md:col-span-2">
            <label className={labelClass}>Do you have access to a computer?*</label>
            <div className="mt-2 flex items-center space-x-4">
                <label className="inline-flex items-center">
                    <input type="radio" name="computerAccess" value="Yes" checked={formData.computerAccess === "Yes"} onChange={handleChange} className={radioCheckClass.replace('form-checkbox', 'form-radio')}/>
                    <span className="ml-2 text-sm">Yes</span>
                </label>
                 <label className="inline-flex items-center">
                    <input type="radio" name="computerAccess" value="No" checked={formData.computerAccess === "No"} onChange={handleChange} className={radioCheckClass.replace('form-checkbox', 'form-radio')}/>
                    <span className="ml-2 text-sm">No</span>
                </label>
                 <label className="inline-flex items-center">
                    <input type="radio" name="computerAccess" value="Other" checked={formData.computerAccess === "Other"} onChange={handleChange} className={radioCheckClass.replace('form-checkbox', 'form-radio')}/>
                    <span className="ml-2 text-sm">Other</span>
                </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className={prevButtonClass}>Previous</button>
        <div className='flex justify-end gap-4'>
            <button className={clearButtonClass}>Clear Form</button>
            <button onClick={nextStep} className={buttonClass}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Education; 