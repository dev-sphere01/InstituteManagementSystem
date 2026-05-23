import { useState } from 'react';
import { X, Plus, Trash2, Eye, Link as LinkIcon, Copy, GripVertical, Mail } from 'lucide-react';
import callingService from '@/services/callingService';
import { useNotification } from '@/services/NotificationService';

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

const FormBuilderModal = ({ isOpen, onClose, leadId, leadEmail, leadName }) => {
  const notify = useNotification();
  const [formFields, setFormFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailToSend, setEmailToSend] = useState(leadEmail || '');

  const toast = {
    success: (msg, opts) => notify(msg, 'success', opts),
    info: (msg, opts) => notify(msg, 'info', opts),
    warning: (msg, opts) => notify(msg, 'warning', opts),
    error: (msg, opts) => notify(msg, 'error', opts),
    loading: (msg, opts) => notify(msg, 'pending', opts)
  };

  // Load saved templates on mount
  useState(() => {
    if (isOpen) {
      const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      setSavedTemplates(templates);
      setEmailToSend(leadEmail || '');
    }
  }, [isOpen, leadEmail]);

  if (!isOpen) return null;

  const addField = (elementType) => {
    const newField = {
      id: Date.now(),
      type: elementType.type,
      label: '',
      required: false,
      options: elementType.type === 'radio' || elementType.type === 'select' ? ['Option 1'] : null,
    };
    setFormFields([...formFields, newField]);
    setEditingField(newField.id);
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  const updateField = (id, updates) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  const removeField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
    if (editingField === id) setEditingField(null);
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...formFields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    
    setFormFields(newFields);
    setDraggedIndex(index);
    setGeneratedLink(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addOption = (fieldId) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId && field.options) {
        return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
      }
      return field;
    }));
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId && field.options) {
        const newOptions = [...field.options];
        newOptions[optionIndex] = value;
        return { ...field, options: newOptions };
      }
      return field;
    }));
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  const removeOption = (fieldId, optionIndex) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId && field.options) {
        return { ...field, options: field.options.filter((_, i) => i !== optionIndex) };
      }
      return field;
    }));
    // Clear generated link when form is modified
    setGeneratedLink(null);
  };

  const generateLink = async () => {
    // Validate all fields have labels
    const invalidFields = formFields.filter(f => !f.label.trim());
    if (invalidFields.length > 0) {
      toast.warning('All fields must have labels!');
      return;
    }

    if (formFields.length === 0) {
      toast.warning('Please add at least one field!');
      return;
    }

    setIsGenerating(true);
    try {
      // Auto-save as template if name is provided
      if (templateName.trim()) {
        const template = {
          id: Date.now(),
          name: templateName.trim(),
          fields: formFields,
          createdAt: new Date().toISOString(),
        };

        const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        // Check if template with same name exists
        const existingIndex = templates.findIndex(t => t.name === template.name);
        if (existingIndex >= 0) {
          // Update existing template
          templates[existingIndex] = template;
        } else {
          // Add new template
          templates.push(template);
        }
        localStorage.setItem('formTemplates', JSON.stringify(templates));
        setSavedTemplates(templates);
      }

      // Encrypt form data
      const formData = {
        leadId,
        fields: formFields,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      const encrypted = btoa(JSON.stringify(formData));
      const link = `${window.location.origin}/form/${encrypted}`;
      setGeneratedLink(link);
      toast.success('Form link generated successfully!');
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error('Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast.warning('Please enter a template name');
      return;
    }

    const template = {
      id: Date.now(),
      name: templateName,
      fields: formFields,
      createdAt: new Date().toISOString(),
    };

    const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    templates.push(template);
    localStorage.setItem('formTemplates', JSON.stringify(templates));
    setSavedTemplates(templates);
    setTemplateName('');
    toast.success('Template saved successfully!');
  };

  const loadTemplate = (template) => {
    setFormFields(template.fields.map(f => ({ ...f, id: Date.now() + Math.random() })));
    setGeneratedLink(null);
    setShowTemplates(false);
  };

  const deleteTemplate = (templateId) => {
    if (!confirm('Delete this template?')) return;
    const templates = savedTemplates.filter(t => t.id !== templateId);
    localStorage.setItem('formTemplates', JSON.stringify(templates));
    setSavedTemplates(templates);
  };

  const handleEmailButtonClick = () => {
    if (!emailToSend || !emailToSend.trim()) {
      setShowEmailInput(true);
    } else {
      sendEmail();
    }
  };

  const sendEmail = async () => {
    if (!emailToSend || !emailToSend.trim()) {
      toast.warning('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      toast.warning('Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await callingService.sendFormEmail(
        leadId,
        emailToSend,
        leadName,
        generatedLink
      );

      if (response.success) {
        toast.success(`Email sent successfully to ${emailToSend}!`);
        setShowEmailInput(false);
      } else {
        toast.error('Failed to send email: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'textarea':
        return <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" disabled />;
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center">
                <input type="radio" name={`field-${field.id}`} className="mr-2" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" disabled />
            <span>Checkbox option</span>
          </label>
        );
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
            <option>Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
              <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
            </div>
          </div>
        );
      default:
        return <input type={field.type} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />;
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#465263' }}>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Form Builder</h2>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              {showTemplates ? 'Hide' : 'Load'} Templates ({savedTemplates.length})
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
            <h3 className="font-semibold mb-3">Saved Templates</h3>
            {savedTemplates.length === 0 ? (
              <p className="text-sm text-gray-600">No templates saved yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {savedTemplates.map(template => (
                  <div key={template.id} className="p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.fields.length} fields</p>
                      </div>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="w-full px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Form Elements */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
            <div className="space-y-2">
              {FORM_ELEMENTS.map((element) => (
                <button
                  key={element.type}
                  onClick={() => addField(element)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                >
                  <span className="flex items-center">
                    <span className="text-2xl mr-3">{element.icon}</span>
                    <span className="font-medium">{element.label}</span>
                  </span>
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Form Preview
              </h3>
              <span className="text-sm text-gray-500">{formFields.length} fields</span>
            </div>

            {formFields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No fields added yet</p>
                <p className="text-sm mt-2">Click on form elements to add them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formFields.map((field, index) => (
                  <div 
                    key={field.id} 
                    className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 mr-2 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Enter field label *"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="mr-2"
                            />
                            Required
                          </label>
                        </div>
                        
                        {/* Options editor for radio/select */}
                        {(field.type === 'radio' || field.type === 'select') && (
                          <div className="mt-3 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Options:</label>
                            {field.options?.map((option, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(field.id, i, e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                                {field.options.length > 1 && (
                                  <button
                                    onClick={() => removeOption(field.id, i)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(field.id)}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Option
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeField(field.id)}
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Field Preview */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label || 'Field Label'} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFieldPreview(field)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {generatedLink ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg mb-3">
                <p className="text-sm font-medium text-green-800">✓ Link Generated Successfully!</p>
                <p className="text-xs text-green-700 mt-1">Any changes to the form will require regenerating the link.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                  <button
                    onClick={handleEmailButtonClick}
                    disabled={isSendingEmail}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingEmail ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
                
                {/* Email Input Section */}
                {showEmailInput && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="email"
                      value={emailToSend}
                      onChange={(e) => setEmailToSend(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendEmail}
                      disabled={isSendingEmail || !emailToSend.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSendingEmail ? 'Sending...' : 'Send'}
                    </button>
                    <button
                      onClick={() => setShowEmailInput(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                ⏰ This link will expire in 24 hours and can only be submitted once.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name (optional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={saveAsTemplate}
                  disabled={formFields.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Save Template
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {formFields.length} field(s) added
                </p>
                <button
                  onClick={generateLink}
                  disabled={isGenerating || formFields.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilderModal;
