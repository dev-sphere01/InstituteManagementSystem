import React, { useState } from 'react';
import API from './../../../../services/API';
import { useNotification } from './../../../../services/NotificationService';
import { useThemeStore } from './../../../../store';

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

  const handleFileChange = (e, field) => {
    setLocalFiles((prev) => ({
      ...prev,
      [field]: e.target.files[0], // Only allow one file per field
    }));
  };

  // Upload a single file for a field
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

  const handleSubmit = async () => {
    setUploading(true);
    try {
      console.log('Files to upload:', localFiles); // Debug: see what files are selected
      const updatedData = { ...formData };
      const allFields = [
        ...fileFields.candidate,
        ...fileFields.academic,
        ...fileFields.optional,
      ];

      for (const { name } of allFields) {
        const uploadedPath = await uploadFile(name, localFiles[name]);
        if (uploadedPath) {
          updatedData[name] = uploadedPath;
          setFormData((prev) => ({ ...prev, [name]: uploadedPath }));
        }
      }

      await onNext(updatedData);
    } finally {
      setUploading(false);
    }
  };

  const sectionCard = (title, fields) => (
    <div
      className={`p-4 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
          }`}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label
              className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
            >
              {label}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, name)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
                }`}
            />
            {formData[name] && (
              <a
                href={
                  `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v\d+\/?$/, '')}/${formData[name]}`
                }
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
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
        }`}
    >
      <h2
        className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-blue-900'
          }`}
      >
        Step 5: Document Uploads
      </h2>

      <div className="space-y-6">
        {sectionCard('👤 Candidate Documents', fileFields.candidate)}
        {sectionCard('📚 Academic Documents', fileFields.academic)}
        {sectionCard('📎 Optional Proofs', fileFields.optional)}
      </div>

      <div className="flex items-center justify-between pt-8 mt-10 border-t border-gray-300 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 ${isDarkMode
              ? 'bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700'
              : 'bg-white border border-gray-300 text-blue-700 hover:bg-blue-50'
            }`}
          disabled={uploading}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 ${uploading
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
