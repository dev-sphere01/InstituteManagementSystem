import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import callingFormService from '@/services/callingFormService';

const FORM_ELEMENTS = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'number', label: 'Number Input', icon: '🔢' },
  { type: 'email', label: 'Email Input', icon: '📧' },
  { type: 'date', label: 'Date Input', icon: '📅' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'radio', label: 'Radio Options', icon: '⭕' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'file', label: 'File Upload', icon: '📎' },
];

const CallingFormBuilder = ({ isOpen, onClose, template, mode, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [],
    isActive: true,
    isDefault: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template && mode === 'edit') {
      setFormData({
        name: template.name,
        description: template.description || '',
        fields: template.fields.map(f => ({ ...f })),
        isActive: template.isActive,
        isDefault: template.isDefault
      });
    }
  }, [template, mode]);

  if (!isOpen) return null;

  const addField = (elementType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: elementType.type,
      label: '',
      placeholder: '',
      required: false,
      options: elementType.type === 'radio' || elementType.type === 'select' ? ['Option 1'] : null,
      sortOrder: formData.fields.length
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const addOption = (fieldIndex) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => {
        if (i === fieldIndex && field.options) {
          return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
        }
        return field;
      })
    }));
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => {
        if (i === fieldIndex && field.options) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return { ...field, options: newOptions };
        }
        return field;
      })
    }));
  };

  const removeOption = (fieldIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => {
        if (i === fieldIndex && field.options) {
          return { ...field, options: field.options.filter((_, oi) => oi !== optionIndex) };
        }
        return field;
      })
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Template name is required');
      return;
    }

    if (formData.fields.length === 0) {
      alert('At least one field is required');
      return;
    }

    const invalidFields = formData.fields.filter(f => !f.label.trim());
    if (invalidFields.length > 0) {
      alert('All fields must have labels');
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'edit' && template) {
        await callingFormService.updateTemplate(template._id, formData);
      } else {
        await callingFormService.createTemplate(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFieldPreview = (field) => {
    const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-lg";
    
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
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" disabled />
            <span className="text-sm">Checkbox option</span>
          </label>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Template' : 'Create Template'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Form Elements */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Template Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Template Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    Active
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="mr-2"
                    />
                    Set as Default
                  </label>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Form Elements</h3>
              <div className="space-y-2">
                {FORM_ELEMENTS.map((element) => (
                  <button
                    key={element.type}
                    onClick={() => addField(element)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    <span className="flex items-center">
                      <span className="text-2xl mr-3">{element.icon}</span>
                      <span className="font-medium text-sm">{element.label}</span>
                    </span>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Form Preview</h3>
              <span className="text-sm text-gray-500">{formData.fields.length} fields</span>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No fields added yet</p>
                <p className="text-sm mt-2">Click on form elements to add them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="cursor-move pt-2">
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
                        
                        {/* Options editor for radio/select */}
                        {(field.type === 'radio' || field.type === 'select') && (
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

                        {/* Field Preview */}
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label || 'Field Label'} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderFieldPreview(field)}
                        </div>
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
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {formData.fields.length} field(s) added
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingFormBuilder;
