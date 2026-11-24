import React, { useState } from 'react';
import API from './../../../../services/API';
import { useNotification } from './../../../../services/NotificationService';
import { useThemeStore } from './../../../../store';
import { toUpper } from '../../../../utils/textFormat';

const fileFields = {
  candidate: [
    { name: 'candidatePhoto', label: 'Candidate Photo' },
    { name: 'candidateLeftThumbImpression', label: 'Left Thumb Impression' },
    { name: 'candidateSignature', label: 'Signature' },
  ],
  academic: [
    { name: 'tenthMarksheet', label: '10th Marksheet' },
    { name: 'twelfthMarksheet', label: '12th Marksheet' },
  ],
  optional: [
    { name: 'aadharPhoto', label: 'Aadhar Card' },
    { name: 'incomeCertificate', label: 'Income Certificate (if EWS)' },
    { name: 'exServicemen', label: 'Ex-Servicemen Proof (if applicable)' },
    { name: 'speciallyAbled', label: 'Disability Certificate (if applicable)' },
  ],
};

const Documents = ({ formId, formData, setFormData, onNext, onBack, validationsEnabled }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState({});
  const [errors, setErrors] = useState({});

  // ID Proof Numbers
  const [idProofs, setIdProofs] = useState({
    panCardNumber: formData.panCardNumber || '',
    drivingLicenceNumber: formData.drivingLicenceNumber || '',
    passportNumber: formData.passportNumber || '',
    epicNumber: formData.epicNumber || '',
  });

  const handleIdProofNumberChange = (field, value) => {
    const uppercaseValue = toUpper(value.trim());
    setIdProofs((prev) => ({ ...prev, [field]: uppercaseValue }));
    setFormData((prev) => ({ ...prev, [field]: uppercaseValue }));
    if (errors[field] || errors.generalId) {
      setErrors((prev) => ({ ...prev, [field]: '', generalId: '' }));
    }
  };

  const handleFileChange = (e, field) => {
    setLocalFiles((prev) => ({
      ...prev,
      [field]: e.target.files[0],
    }));
  };

  const uploadFile = async (fieldName, file) => {
    if (!file) return formData[fieldName] || '';
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const res = await API.post(`/admissions/upload/${formId}/${fieldName}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res && res.path) {
        notify(`${fieldName} uploaded successfully`, 'success');
        return res.path;
      } else {
        notify(`Failed to upload ${fieldName}`, 'error');
        return '';
      }
    } catch (err) {
      console.error(err);
      notify(`Failed to upload ${fieldName}`, 'error');
      return '';
    }
  };

  // Format validations for ID Proofs
  const validateIdProofs = () => {
    if (!validationsEnabled) return true;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const passportRegex = /^[A-Z][0-9]{7}$/;
    const epicRegex = /^[A-Z]{3}[0-9]{7}$/;
    // Indian Driving Licence standard format (supports alphanumeric state + RTO + year + sequence)
    const dlRegex = /^[A-Z]{2}[0-9A-Z\s-]{8,18}$/;

    const errs = {};
    let validCount = 0;

    if (idProofs.panCardNumber) {
      if (!panRegex.test(idProofs.panCardNumber)) {
        errs.panCardNumber = 'Invalid PAN format (e.g. ABCDE1234F)';
      } else {
        validCount++;
      }
    }

    if (idProofs.drivingLicenceNumber) {
      if (!dlRegex.test(idProofs.drivingLicenceNumber)) {
        errs.drivingLicenceNumber = 'Invalid DL format (e.g. UP32-2020-0012345)';
      } else {
        validCount++;
      }
    }

    if (idProofs.passportNumber) {
      if (!passportRegex.test(idProofs.passportNumber)) {
        errs.passportNumber = 'Invalid Passport format (1 letter + 7 digits, e.g. A1234567)';
      } else {
        validCount++;
      }
    }

    if (idProofs.epicNumber) {
      if (!epicRegex.test(idProofs.epicNumber)) {
        errs.epicNumber = 'Invalid Voter ID (EPIC) format (3 letters + 7 digits, e.g. ABC1234567)';
      } else {
        validCount++;
      }
    }

    // Require at least ONE ID Proof
    if (validCount === 0 && Object.keys(errs).length === 0) {
      errs.generalId = 'At least ONE valid ID Proof is required (PAN Card, Driving Licence, Passport, or EPIC/Voter ID)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateIdProofs()) {
      notify('Please provide at least one valid ID proof.', 'error');
      return;
    }

    setUploading(true);
    try {
      const updatedData = {
        ...formData,
        ...idProofs,
      };

      const allFileKeys = [
        ...fileFields.candidate,
        ...fileFields.academic,
        ...fileFields.optional,
        { name: 'panCardDoc', label: 'PAN Card Doc' },
        { name: 'drivingLicenceDoc', label: 'DL Doc' },
        { name: 'passportDoc', label: 'Passport Doc' },
        { name: 'epicDoc', label: 'EPIC Doc' },
      ];

      for (const { name } of allFileKeys) {
        if (localFiles[name]) {
          const uploadedPath = await uploadFile(name, localFiles[name]);
          if (uploadedPath) {
            updatedData[name] = uploadedPath;
            setFormData((prev) => ({ ...prev, [name]: uploadedPath }));
          }
        }
      }

      await onNext(updatedData);
    } finally {
      setUploading(false);
    }
  };

  const sectionCard = (title, fields) => (
    <div
      className={`p-4 rounded-xl shadow-md ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label
              className={`block text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {label}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, name)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              }`}
            />
            {formData[name] && (
              <a
                href={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v\d+\/?$/, '')}/${formData[name]}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View uploaded
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}
      >
        Step 5: ID Proof &amp; Document Uploads
      </h2>

      {/* Mandatory ID Proof Section */}
      <div
        className={`p-6 rounded-xl shadow-md mb-6 border-2 ${
          errors.generalId
            ? 'border-red-500 bg-red-50/10'
            : isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-blue-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span>ðŸªª</span> Mandatory ID Proof
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Please enter at least ONE valid government ID number (PAN, DL, Passport, or EPIC/Voter ID) with optional document upload.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-bold w-fit mt-2 sm:mt-0">
            At least 1 required
          </span>
        </div>

        {errors.generalId && (
          <div className="p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
            âš  {errors.generalId}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PAN Card */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              1. PAN Card Number
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. ABCDE1234F"
              value={idProofs.panCardNumber}
              onChange={(e) => handleIdProofNumberChange('panCardNumber', e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border mb-2 uppercase ${
                errors.panCardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-800`}
            />
            {errors.panCardNumber && <p className="text-xs text-red-500 mb-2">{errors.panCardNumber}</p>}
            <label className="block text-xs text-gray-500 mb-1">Optional PAN Document:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, 'panCardDoc')}
              className="w-full text-xs text-gray-500"
            />
          </div>

          {/* Driving Licence */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              2. Driving Licence (DL)
            </label>
            <input
              type="text"
              placeholder="e.g. UP3220200012345"
              value={idProofs.drivingLicenceNumber}
              onChange={(e) => handleIdProofNumberChange('drivingLicenceNumber', e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border mb-2 uppercase ${
                errors.drivingLicenceNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-800`}
            />
            {errors.drivingLicenceNumber && <p className="text-xs text-red-500 mb-2">{errors.drivingLicenceNumber}</p>}
            <label className="block text-xs text-gray-500 mb-1">Optional DL Document:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, 'drivingLicenceDoc')}
              className="w-full text-xs text-gray-500"
            />
          </div>

          {/* Passport */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              3. Passport Number
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="e.g. A1234567"
              value={idProofs.passportNumber}
              onChange={(e) => handleIdProofNumberChange('passportNumber', e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border mb-2 uppercase ${
                errors.passportNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-800`}
            />
            {errors.passportNumber && <p className="text-xs text-red-500 mb-2">{errors.passportNumber}</p>}
            <label className="block text-xs text-gray-500 mb-1">Optional Passport Document:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, 'passportDoc')}
              className="w-full text-xs text-gray-500"
            />
          </div>

          {/* EPIC / Voter ID */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              4. EPIC (Voter ID)
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. ABC1234567"
              value={idProofs.epicNumber}
              onChange={(e) => handleIdProofNumberChange('epicNumber', e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border mb-2 uppercase ${
                errors.epicNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-800`}
            />
            {errors.epicNumber && <p className="text-xs text-red-500 mb-2">{errors.epicNumber}</p>}
            <label className="block text-xs text-gray-500 mb-1">Optional Voter ID Document:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, 'epicDoc')}
              className="w-full text-xs text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sectionCard('ðŸ‘¤ Candidate Documents', fileFields.candidate)}
        {sectionCard('ðŸ“š Academic Documents', fileFields.academic)}
        {sectionCard('ðŸ“Ž Optional Proofs', fileFields.optional)}
      </div>

      <div className="flex items-center justify-between pt-8 mt-10 border-t border-gray-300 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700'
              : 'bg-white border border-gray-300 text-blue-700 hover:bg-blue-50'
          }`}
          disabled={uploading}
        >
          â†  Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 ${
            uploading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Documents;
