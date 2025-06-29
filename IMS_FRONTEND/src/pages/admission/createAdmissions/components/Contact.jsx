import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';

const Contact = ({ onNext, onBack, validationsEnabled = true, formData = {} }) => {
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
    fathersJobRole: '',
    departmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

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

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please fill all required contact fields.', 'error');
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
    `w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-700 bg-[#23272f] text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-semibold mb-1 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-800'
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

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${
        isDarkMode
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
        {renderInput({ label: 'State', name: 'state', required: true })}
        {renderInput({ label: 'District', name: 'district', required: true })}
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
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDarkMode
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
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading
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
