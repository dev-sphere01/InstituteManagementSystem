import { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';
import { useNotification } from '@/services/NotificationService';

const FORM_ELEMENTS = [
  { type: 'text', label: 'Text Input', icon: 'T' },
  { type: 'number', label: 'Number Input', icon: '123' },
  { type: 'email', label: 'Email Input', icon: '@' },
  { type: 'date', label: 'Date Input', icon: 'D' },
  { type: 'textarea', label: 'Text Area', icon: 'TA' },
  { type: 'radio', label: 'Radio Options', icon: 'R' },
  { type: 'checkbox', label: 'Checkbox', icon: 'C' },
  { type: 'select', label: 'Dropdown', icon: 'DD' },
  { type: 'file', label: 'File Upload', icon: 'F' }
];

/**
 * FormBuilder - Reusable form builder component
 *
 * @param {Object} props
 * @param {Array} props.initialFields - Initial fields configuration
 * @param {Function} props.onSave - Save handler (receives fields array)
 * @param {Boolean} props.showPreview - Show preview panel (default: true)
 * @param {String} props.saveButtonText - Save button text (default: "Save Form")
 * @param {Boolean} props.showMetadata - Show name/description fields (default: true)
 * @param {Object} props.initialMetadata - Initial metadata { name, description }
 * @param {String} props.className - Additional CSS classes
 * @param {Function} props.onChange - Called when fields/metadata change
 */
const FormBuilder = ({
  initialFields = [],
  onSave,
  showPreview = true,
  saveButtonText = 'Save Form',
  showMetadata = true,
  initialMetadata = { name: '', description: '' },
  className = '',
  onChange
}) => {
  const notify = useNotification();
  const [fields, setFields] = useState(initialFields);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [isSaving, setIsSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(showPreview);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (onChange) {
      onChange({
        fields,
        metadata
      });
    }
  }, [fields, metadata, onChange]);

  const addField = (elementType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: elementType.type,
      label: '',
      placeholder: '',
      required: false,
      options: elementType.type === 'radio' || elementType.type === 'select' || elementType.type === 'checkbox'
        ? ['Option 1']
        : null,
      sortOrder: fields.length
    };
    setFields([...fields, newField]);
  };

  const updateField = (index, updates) => {
    setFields(fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    ));
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    setFields(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addOption = (fieldIndex) => {
    setFields(fields.map((field, i) => {
      if (i === fieldIndex && field.options) {
        return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
      }
      return field;
    }));
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    setFields(fields.map((field, i) => {
      if (i === fieldIndex && field.options) {
        const newOptions = [...field.options];
        newOptions[optionIndex] = value;
        return { ...field, options: newOptions };
      }
      return field;
    }));
  };

  const removeOption = (fieldIndex, optionIndex) => {
    setFields(fields.map((field, i) => {
      if (i === fieldIndex && field.options) {
        return { ...field, options: field.options.filter((_, oi) => oi !== optionIndex) };
      }
      return field;
    }));
  };

  const handleSave = async () => {
    if (showMetadata && !metadata.name.trim()) {
      notify('Form name is required', 'warning');
      return;
    }

    if (fields.length === 0) {
      notify('At least one field is required', 'warning');
      return;
    }

    const invalidFields = fields.filter((f) => !f.label.trim());
    if (invalidFields.length > 0) {
      notify('All fields must have labels', 'warning');
      return;
    }

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave({
          fields,
          ...(showMetadata && metadata)
        });
        notify('Form saved successfully', 'success');
      } catch (error) {
        console.error('Error saving form:', error);
        notify(error.response?.data?.error || 'Failed to save form', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const renderFieldPreview = (field) => {
    const baseClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg';

    switch (field.type) {
      case 'textarea':
        return <textarea className={baseClass} rows="3" placeholder={field.placeholder} disabled />;
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center">
                <input type="radio" name={`preview-${field.id}`} className="mr-2" disabled />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options && field.options.length > 0 ? field.options : ['Option']).map((option, i) => (
              <label key={i} className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select className={baseClass} disabled>
            <option>Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <span className="text-sm text-gray-500">File upload field</span>
          </div>
        );
      default:
        return <input type={field.type} className={baseClass} placeholder={field.placeholder} disabled />;
    }
  };

  return (
    <div className={`grid grid-cols-12 gap-4 ${className}`}>
      <div className="col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Form Elements</h3>
          <div className="space-y-2">
            {FORM_ELEMENTS.map((element) => (
              <button
                key={element.type}
                onClick={() => addField(element)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
              >
                <span className="flex items-center">
                  <span className="text-xs font-semibold text-gray-500 mr-3 w-8 text-center">{element.icon}</span>
                  <span className="font-medium text-sm">{element.label}</span>
                </span>
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${previewVisible ? 'col-span-5' : 'col-span-9'}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {showMetadata && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Form Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter form name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Form Fields</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{fields.length} fields</span>
              {showPreview && (
                <button
                  onClick={() => setPreviewVisible(!previewVisible)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={previewVisible ? 'Hide Preview' : 'Show Preview'}
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              <p>No fields added yet</p>
              <p className="text-sm mt-2">Click on form elements to add them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-start gap-2">
                    <div className="cursor-grab active:cursor-grabbing pt-2">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="Enter field label *"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <label className="flex items-center text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="mr-2"
                          />
                          Required
                        </label>
                      </div>

                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Placeholder text (optional)"
                        className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      {(field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') && (
                        <div className="mt-3 space-y-2">
                          <label className="text-sm font-medium text-gray-700">Options:</label>
                          {field.options?.map((option, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, oi, e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              {field.options.length > 1 && (
                                <button
                                  onClick={() => removeOption(index, oi)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : saveButtonText}
            </button>
          </div>
        </div>
      </div>

      {previewVisible && (
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Live Preview</h3>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label || 'Field Label'} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderFieldPreview(field)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
