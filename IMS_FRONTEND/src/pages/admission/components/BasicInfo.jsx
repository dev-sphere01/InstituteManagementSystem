import React from 'react';
import { getAdmissionStyleClasses } from '../styleClasses';

const BasicInfo = ({ formData, setFormData, nextStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const { cardClass, sectionTitleClass, labelClass, inputClass, buttonClass, clearButtonClass } = getAdmissionStyleClasses();

  return (
    <div className={cardClass}>
      <h2 className={sectionTitleClass}>Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Form No (F + Branch + Unique Number)*</label>
          <input type="text" name="formNo" value={formData.formNo || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Center Code*</label>
          <select name="centerCode" value={formData.centerCode || ''} onChange={handleChange} className={inputClass}>
            <option>Select Center Code</option>
            {/* Add center code options here */}
          </select>
        </div>
        <div>
          <label className={labelClass}>Employee ID (E + Branch + Unique Number)*</label>
          <input type="text" name="employeeId" value={formData.employeeId || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Other Info (if needed)</label>
          <input type="text" name="otherInfo" value={formData.otherInfo || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Registration No (R + Branch + Month + Year + ID)*</label>
          <div className="flex items-center">
            <input type="text" name="generatedRegNo" value={formData.generatedRegNo || ''} onChange={handleChange} className={inputClass} />
            <button className={`ml-2 ${buttonClass}`}>Generate</button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Full Name*</label>
          <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date of Birth*</label>
          <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Gender*</label>
          <select name="gender" value={formData.gender || ''} onChange={handleChange} className={inputClass}>
            <option>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Category*</label>
          <select name="category" value={formData.category || ''} onChange={handleChange} className={inputClass}>
            <option>Select Category</option>
            {/* Add category options here */}
          </select>
        </div>
        <div>
          <label className={labelClass}>Aadhar No*</label>
          <input type="text" name="aadharNo" value={formData.aadharNo || ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Religion*</label>
          <select name="religion" value={formData.religion || ''} onChange={handleChange} className={inputClass}>
            <option>Select Religion</option>
            {/* Add religion options here */}
          </select>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button className={clearButtonClass}>Clear Form</button>
        <button onClick={nextStep} className={buttonClass}>Next</button>
      </div>
    </div>
  );
};

export default BasicInfo;