import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';

const Contact = ({ onNext, onBack, loading, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
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
    fathersJobRole: '',
    departmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    if (!validationsEnabled) return true;
    const errs = {};
    const requiredFields = [
      'contactNumber', 'emailAddress', 'state', 'district', 'address',
      'pinCode', 'fathersName', 'fathersOccupation', 'mothersName'
    ];
    requiredFields.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = 'Required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (typeof onNext === 'function') onNext(form);
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field] ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
    }`;

  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-xl shadow-md p-6 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-full">
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Details</h2>
      </div>

      <div>
        <label className={labelClass}>Contact Number <span className="text-red-500">*</span></label>
        <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} className={inputClass('contactNumber')} />
        {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
      </div>
      <div>
        <label className={labelClass}>Alternate Contact Number</label>
        <input type="text" name="alternateContactNumber" value={form.alternateContactNumber} onChange={handleChange} className={inputClass('alternateContactNumber')} />
      </div>

      <div>
        <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
        <input type="email" name="emailAddress" value={form.emailAddress} onChange={handleChange} className={inputClass('emailAddress')} />
        {errors.emailAddress && <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>}
      </div>
      <div>
        <label className={labelClass}>State <span className="text-red-500">*</span></label>
        <input type="text" name="state" value={form.state} onChange={handleChange} className={inputClass('state')} />
        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
      </div>

      <div>
        <label className={labelClass}>District <span className="text-red-500">*</span></label>
        <input type="text" name="district" value={form.district} onChange={handleChange} className={inputClass('district')} />
        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
      </div>
      <div>
        <label className={labelClass}>Pin Code <span className="text-red-500">*</span></label>
        <input type="text" name="pinCode" value={form.pinCode} onChange={handleChange} className={inputClass('pinCode')} />
        {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
      </div>

      <div className="col-span-full">
        <label className={labelClass}>Address <span className="text-red-500">*</span></label>
        <textarea name="address" value={form.address} onChange={handleChange} rows="3" className={inputClass('address')}></textarea>
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div>
        <label className={labelClass}>Father's Name <span className="text-red-500">*</span></label>
        <input type="text" name="fathersName" value={form.fathersName} onChange={handleChange} className={inputClass('fathersName')} />
        {errors.fathersName && <p className="text-red-500 text-sm mt-1">{errors.fathersName}</p>}
      </div>
      <div>
        <label className={labelClass}>Father's Occupation <span className="text-red-500">*</span></label>
        <input type="text" name="fathersOccupation" value={form.fathersOccupation} onChange={handleChange} className={inputClass('fathersOccupation')} />
        {errors.fathersOccupation && <p className="text-red-500 text-sm mt-1">{errors.fathersOccupation}</p>}
      </div>

      <div>
        <label className={labelClass}>Father's Job Role</label>
        <input type="text" name="fathersJobRole" value={form.fathersJobRole} onChange={handleChange} className={inputClass('fathersJobRole')} />
      </div>
      <div>
        <label className={labelClass}>Department/Company</label>
        <input type="text" name="departmentOrCompany" value={form.departmentOrCompany} onChange={handleChange} className={inputClass('departmentOrCompany')} />
      </div>

      <div>
        <label className={labelClass}>Mother's Name <span className="text-red-500">*</span></label>
        <input type="text" name="mothersName" value={form.mothersName} onChange={handleChange} className={inputClass('mothersName')} />
        {errors.mothersName && <p className="text-red-500 text-sm mt-1">{errors.mothersName}</p>}
      </div>
      <div>
        <label className={labelClass}>Guardian's Name</label>
        <input type="text" name="guardianName" value={form.guardianName} onChange={handleChange} className={inputClass('guardianName')} />
      </div>

      <div>
        <label className={labelClass}>Guardian's Relation</label>
        <input type="text" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} className={inputClass('guardianRelation')} />
      </div>
      <div>
        <label className={labelClass}>Guardian's Contact Number</label>
        <input type="text" name="guardianContactNumber" value={form.guardianContactNumber} onChange={handleChange} className={inputClass('guardianContactNumber')} />
      </div>

      <div className="col-span-full flex justify-between gap-2 mt-4">
        <button
          type="button"
          onClick={onBack}
          className={`px-4 py-2 text-sm rounded-md shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode ? 'text-gray-300 border-gray-600 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
          }`}
          disabled={loading}
        >
          Back
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-sm rounded-md shadow-sm text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default Contact;
