import React, { useState } from 'react';
import API from './../../../../services/api';
import { useNotification } from './../../../../services/NotificationService';

const fileFields = [
  { name: 'aadharPhoto', label: 'Aadhar Card Photo' },
  { name: 'candidatePhoto', label: 'Candidate Photo' },
  { name: 'candidateSignature', label: 'Candidate Signature' },
  { name: 'candidateLeftThumbImpression', label: 'Left Thumb Impression (Base64 for now)' },
  { name: 'tenthMarksheet', label: '10th Marksheet (Base64 for now)' },
  { name: 'twelfthMarksheet', label: '12th Marksheet (Base64 for now)' },
  { name: 'incomeCertificate', label: 'Income Certificate (if EWS)' },
  { name: 'exServicemen', label: 'Ex-Servicemen Proof (if applicable)' },
  { name: 'speciallyAbled', label: 'Disability Certificate (if applicable)' },
];

const Documents = ({ formData, onNext, onBack, validationsEnabled }) => {
  const notify = useNotification();
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState({});

  const handleFileChange = (e, field) => {
    setLocalFiles((prev) => ({
      ...prev,
      [field]: e.target.files[0]
    }));
  };

  const uploadFile = async (fieldName, file) => {
    if (!file) return formData[fieldName] || '';

    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await API.post(`/admissions/upload/${formData._id}/${fieldName}`, formDataObj);
      notify(`${fieldName} uploaded successfully`, 'success');
      return res.path;
    } catch (err) {
      console.error(err);
      notify(`Failed to upload ${fieldName}`, 'error');
      return '';
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const updatedData = { ...formData };

      for (const { name } of fileFields) {
        if (['candidateLeftThumbImpression', 'tenthMarksheet', 'twelfthMarksheet'].includes(name)) {
          // These remain base64 for now, do not upload
          continue;
        }
        const uploadedPath = await uploadFile(name, localFiles[name]);
        if (uploadedPath) {
          updatedData[name] = uploadedPath;
        }
      }

      await onNext(updatedData);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-gray-900 shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📄 Upload Documents</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fileFields.map(({ name, label }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, name)}
              className="rounded border px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
            {formData[name] && (
              <a
                href={formData[name]}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View uploaded file
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Documents;
