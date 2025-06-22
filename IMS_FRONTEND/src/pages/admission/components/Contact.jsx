import React from 'react';
import { getAdmissionStyleClasses } from '../styleClasses';

const Contact = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const { cardClass, sectionTitleClass, labelClass, inputClass, buttonClass, prevButtonClass, clearButtonClass } = getAdmissionStyleClasses();

  return (
    <div className={cardClass}>
      <div className="mb-6">
        <h3 className={sectionTitleClass}>Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Contact Number (WhatsApp)*</label>
            <input type="text" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Alternate Contact Number</label>
            <input type="text" name="alternateContactNumber" value={formData.alternateContactNumber || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Email Address*</label>
            <input type="email" name="emailAddress" value={formData.emailAddress || ''} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className={sectionTitleClass}>Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>State*</label>
            <select name="state" value={formData.state || ''} onChange={handleChange} className={inputClass}>
              <option>Select State</option>
              {/* Add state options here */}
            </select>
          </div>
          <div>
            <label className={labelClass}>District*</label>
            <input type="text" name="district" value={formData.district || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Residential Address*</label>
            <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="3" className={inputClass}></textarea>
          </div>
          <div>
            <label className={labelClass}>Pin Code*</label>
            <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <div>
        <h3 className={sectionTitleClass}>Family Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Father's Name*</label>
            <input type="text" name="fathersName" value={formData.fathersName || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Father's Occupation</label>
            <input type="text" name="fathersOccupation" value={formData.fathersOccupation || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Mother's Name</label>
            <input type="text" name="mothersName" value={formData.mothersName || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center">
              <input type="checkbox" name="hasGuardian" checked={formData.hasGuardian || false} onChange={(e) => setFormData({ ...formData, hasGuardian: e.target.checked })} className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500" />
              <span className="ml-2 text-sm">Student has a guardian other than parents</span>
            </label>
          </div>
          {formData.hasGuardian && (
            <>
              <div>
                <label className={labelClass}>Guardian's Name</label>
                <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Guardian's Relation</label>
                <input type="text" name="guardianRelation" value={formData.guardianRelation || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Guardian's Contact Number</label>
                <input type="text" name="guardianContactNumber" value={formData.guardianContactNumber || ''} onChange={handleChange} className={inputClass} />
              </div>
            </>
          )}
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

export default Contact; 