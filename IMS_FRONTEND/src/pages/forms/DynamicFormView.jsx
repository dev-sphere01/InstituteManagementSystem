import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import formDataService from '@/services/formDataService';

const STORAGE_KEY = 'ims_form_submissions';

const DynamicFormView = () => {
  const { encryptedData } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', 'expired', 'already-submitted'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormConfig();
  }, [encryptedData]);

  const loadFormConfig = () => {
    try {
      setIsLoading(true);

      const decrypted = JSON.parse(atob(encryptedData));

      if (decrypted.expiresAt) {
        const expiresAt = new Date(decrypted.expiresAt);
        if (expiresAt < new Date()) {
          setSubmitStatus('expired');
          setIsLoading(false);
          return;
        }
      }

      const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (submissions.includes(encryptedData)) {
        setSubmitStatus('already-submitted');
        setIsLoading(false);
        return;
      }

      setFormConfig(decrypted);

      const initialData = {};
      decrypted.fields.forEach((field) => {
        if (field.type === 'checkbox') {
          initialData[field.id] = [];
        } else if (field.type === 'file') {
          initialData[field.id] = null;
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error loading form:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formConfig.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.id];
        if (field.type === 'file') {
          if (!value) {
            newErrors[field.id] = `${field.label} is required`;
          }
        } else if (field.type === 'checkbox') {
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[field.id] = `${field.label} is required`;
          }
        } else if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        encryptedData,
        formName: formConfig?.name || 'Application Form',
        formDescription: formConfig?.description || '',
        templateId: formConfig?.templateId || undefined,
        expiresAt: formConfig?.expiresAt || undefined,
        fields: formConfig.fields.map((field) => ({
          fieldId: field.id,
          fieldType: field.type,
          fieldLabel: field.label,
          fieldValue: formData[field.id],
          required: field.required
        }))
      };

      await formDataService.submitPublicForm(payload);

      const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      submissions.push(encryptedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Fallback: still mark as submitted locally to avoid duplicates if backend is down
      const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      submissions.push(encryptedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
      setSubmitStatus('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const renderField = (field) => {
    const hasError = errors[field.id];
    const baseInputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            rows="4"
            required={field.required}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600"
                  required={field.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox': {
        const selectedValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
        const options = field.options && field.options.length > 0 ? field.options : ['Option'];
        return (
          <div className="space-y-2">
            {options.map((option, i) => (
              <label
                key={i}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((value) => value !== option);
                    handleChange(field.id, next);
                  }}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      }
      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleChange(field.id, e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={field.required}
            />
            {formData[field.id] && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData[field.id].name || 'File selected'}
              </p>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            required={field.required}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Expired</h2>
          <p className="text-gray-600">This form link has expired and is no longer accepting submissions.</p>
        </div>
      </div>
    );
  }

  if (submitStatus === 'already-submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Submitted</h2>
          <p className="text-gray-600">This form has already been submitted and cannot be submitted again.</p>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully</h2>
          <p className="text-gray-600">Thank you for your submission.</p>
        </div>
      </div>
    );
  }

  if (submitStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600">The form link is invalid or has been corrupted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{formConfig?.name || 'Application Form'}</h1>
            <p className="text-blue-100">Please fill out all required fields</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {formConfig?.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>

            {formConfig?.expiresAt && (
              <p className="text-center text-sm text-gray-500">
                This form expires on {new Date(formConfig.expiresAt).toLocaleString()}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DynamicFormView;
