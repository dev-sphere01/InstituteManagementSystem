import { useState, useEffect, useRef } from 'react';
import { useNotification } from '@/services/NotificationService';
import getBaseFileURL from '@/utils/getBaseFileURL';

/**
 * DynamicForm - Reusable form component
 * 
 * @param {Object} props
 * @param {Array} props.fields - Array of field configurations
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Submit handler (optional)
 * @param {Function} props.onChange - Change handler (optional)
 * @param {Boolean} props.autoSave - Enable auto-save (optional)
 * @param {Function} props.onAutoSave - Auto-save handler (optional)
 * @param {Number} props.autoSaveDelay - Auto-save delay in ms (default: 1000)
 * @param {Boolean} props.showSubmitButton - Show submit button (default: true)
 * @param {String} props.submitButtonText - Submit button text (default: "Submit")
 * @param {Boolean} props.readOnly - Make form read-only (default: false)
 * @param {String} props.className - Additional CSS classes
 * 
 * Field Configuration:
 * {
 *   id: string (required),
 *   type: 'text'|'number'|'email'|'date'|'textarea'|'radio'|'checkbox'|'select'|'file',
 *   label: string (required),
 *   placeholder: string (optional),
 *   required: boolean (optional),
 *   options: array (required for radio/select),
 *   validation: object (optional) { min, max, pattern, message }
 * }
 */
const DynamicForm = ({
  fields = [],
  initialData = {},
  onSubmit,
  onChange,
  autoSave = false,
  onAutoSave,
  autoSaveDelay = 1000,
  showSubmitButton = true,
  submitButtonText = 'Submit',
  readOnly = false,
  className = '',
  compact = false,
  twoColumns = false
}) => {
  const notify = useNotification();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const validateField = (field, value) => {
    if (field.required) {
      if (field.type === 'checkbox') {
        if (!value) return `${field.label} is required`;
      } else if (field.type === 'file') {
        if (!value) return `${field.label} is required`;
      } else if (!value || (typeof value === 'string' && !value.trim())) {
        return `${field.label} is required`;
      }
    }

    if (field.validation && value) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && value < min) {
        return message || `Minimum value is ${min}`;
      }
      
      if (max !== undefined && value > max) {
        return message || `Maximum value is ${max}`;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        return message || 'Invalid format';
      }
    }

    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldId, value) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    // Call onChange callback
    if (onChange) {
      onChange(newFormData);
    }

    // Auto-save if enabled
    if (autoSave && onAutoSave && !readOnly) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(newFormData);
      }, autoSaveDelay);
    }
  };

  const handleAutoSave = async (data) => {
    try {
      setIsSaving(true);
      await onAutoSave(data);
      setIsSaving(false);
    } catch (error) {
      console.error('Auto-save error:', error);
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (!validateForm()) {
      notify('Please fix the errors in the form', 'warning');
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (field) => {
    const hasError = errors[field.id];
    const baseInputClass = `w-full ${compact ? 'px-3 py-2 text-sm' : 'px-3 py-2'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError ? 'border-red-500' : 'border-gray-300'
    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`;

    const value = formData[field.id] ?? (field.type === 'checkbox' ? false : '');

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            rows="3"
            placeholder={field.placeholder}
            required={field.required}
            disabled={readOnly}
          />
        );
      
      case 'radio':
        return (
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            {field.options?.map((option, i) => (
              <label key={i} className={`flex items-center ${compact ? 'p-1.5' : 'p-3'} border border-gray-200 ${compact ? 'rounded' : 'rounded-lg'} hover:bg-gray-50 cursor-pointer ${readOnly ? 'opacity-60' : ''}`}>
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className={`${compact ? 'mr-1.5 h-3 w-3' : 'mr-3 h-4 w-4'} text-blue-600`}
                  required={field.required}
                  disabled={readOnly}
                />
                <span className={compact ? 'text-xs' : 'text-sm'}>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <label className={`flex items-center ${compact ? 'p-1.5' : 'p-3'} border border-gray-200 ${compact ? 'rounded' : 'rounded-lg'} hover:bg-gray-50 cursor-pointer ${readOnly ? 'opacity-60' : ''}`}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className={`${compact ? 'mr-1.5 h-3 w-3' : 'mr-3 h-4 w-4'} text-blue-600`}
              required={field.required}
              disabled={readOnly}
            />
            <span className={compact ? 'text-xs' : 'text-sm'}>{field.placeholder || 'I agree'}</span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            required={field.required}
            disabled={readOnly}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'file':
        const iconSize = compact ? 'h-3.5 w-3.5' : 'h-5 w-5';
        const getFileIcon = (filePath) => {
          const ext = filePath?.split('.').pop()?.toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return (
              <svg className={`${iconSize} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            );
          } else if (['pdf'].includes(ext)) {
            return (
              <svg className={`${iconSize} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            );
          } else {
            return (
              <svg className={`${iconSize} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            );
          }
        };

        const handleFileView = (filePath) => {
          const baseFileUrl = getBaseFileURL();
          const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
          const fileUrl = filePath.startsWith('http') ? filePath : `${baseFileUrl}${cleanPath}`;
          window.open(fileUrl, '_blank');
        };

        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleChange(field.id, e.target.files[0])}
              className={`w-full ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2'} border border-gray-300 ${compact ? 'rounded' : 'rounded-lg'} ${compact ? 'focus:ring-1' : 'focus:ring-2'} focus:ring-blue-500 focus:border-transparent ${compact ? 'file:mr-2 file:py-1 file:px-2 file:text-xs' : 'file:mr-4 file:py-2 file:px-4 file:text-sm'} file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              required={field.required}
              accept={field.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
              disabled={readOnly}
            />
            {value && (
              <div className={compact ? 'mt-1' : 'mt-2'}>
                {typeof value === 'object' && value.name ? (
                  // New file selected (File object)
                  <div className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-2 p-2'} bg-blue-50 border border-blue-200 ${compact ? 'rounded' : 'rounded-lg'}`}>
                    <svg className={`${iconSize} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-medium text-blue-900`}>{value.name}</p>
                      <p className={`${compact ? 'text-[9px]' : 'text-xs'} text-blue-700`}>{(value.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ) : typeof value === 'string' && value ? (
                  // Previously uploaded file (URL/path string)
                  <button
                    type="button"
                    onClick={() => handleFileView(value)}
                    className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-2 p-2'} bg-green-50 border border-green-200 ${compact ? 'rounded' : 'rounded-lg'} hover:bg-green-100 transition-colors w-full`}
                  >
                    {getFileIcon(value)}
                    <div className="flex-1 text-left">
                      <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-medium text-green-900`}>File uploaded</p>
                      <p className={`${compact ? 'text-[9px]' : 'text-xs'} text-green-700`}>Click to view</p>
                    </div>
                    <svg className={`${iconSize} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                ) : null}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={field.placeholder}
            required={field.required}
            disabled={readOnly}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {isSaving && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          Saving...
        </div>
      )}

      <div className={twoColumns ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {fields.map((field) => (
          <div key={field.id}>
            <label className={`block text-sm font-medium text-gray-700 mb-1.5`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      {showSubmitButton && !readOnly && (
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;
