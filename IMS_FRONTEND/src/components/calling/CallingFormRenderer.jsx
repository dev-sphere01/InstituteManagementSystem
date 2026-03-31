import { useState, useEffect } from 'react';
import callingFormService from '@/services/callingFormService';
import { useNotification } from '@/services/NotificationService';
import DynamicForm from '@/components/common/DynamicForm';

const CallingFormRenderer = ({ leadId, onDataChange }) => {
  const notify = useNotification();
  const [template, setTemplate] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplateAndData();
  }, [leadId]);

  const loadTemplateAndData = async () => {
    try {
      setIsLoading(true);
      const templateData = await callingFormService.getDefaultTemplate();
      setTemplate(templateData);
      
      // Try to load existing form data for this lead
      try {
        const existingData = await callingFormService.getFormData(leadId);
        
        // Convert saved form fields to formData object
        const savedData = {};
        existingData.formFields.forEach(field => {
          savedData[field.fieldId] = field.fieldValue;
        });
        setInitialData(savedData);
      } catch (error) {
        // No existing data, initialize with empty values
        const emptyData = {};
        templateData.fields.forEach(field => {
          if (field.type === 'checkbox') {
            emptyData[field.id] = false;
          } else if (field.type === 'file') {
            emptyData[field.id] = null;
          } else {
            emptyData[field.id] = '';
          }
        });
        setInitialData(emptyData);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      notify('Failed to load calling form', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (data) => {
    if (!template) return;

    // Handle file uploads
    const formData = new FormData();
    const fileFields = [];
    
    // Convert formData to formFields array
    const formFields = await Promise.all(template.fields.map(async (field) => {
      let fieldValue = data[field.id];
      
      // Handle file upload
      if (field.type === 'file' && fieldValue && typeof fieldValue === 'object' && fieldValue.name) {
        // Store file info for upload
        fileFields.push({
          fieldId: field.id,
          file: fieldValue
        });
        // Store filename as value
        fieldValue = fieldValue.name;
      }
      
      return {
        fieldId: field.id,
        fieldType: field.type,
        fieldLabel: field.label,
        fieldValue: fieldValue,
        required: field.required
      };
    }));

    // If there are files, upload them first
    if (fileFields.length > 0) {
      fileFields.forEach(({ fieldId, file }) => {
        formData.append('files', file);
        formData.append('fieldIds', fieldId);
      });
      formData.append('leadId', leadId);
      formData.append('templateId', template._id);
      formData.append('formFields', JSON.stringify(formFields));
      
      // Upload with files
      await callingFormService.saveFormDataWithFiles(formData);
    } else {
      // Save without files
      await callingFormService.saveFormData({
        leadId,
        templateId: template._id,
        formFields
      });
    }
  };

  const handleChange = (data) => {
    // Notify parent component
    if (onDataChange) {
      onDataChange(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">No calling form template configured</p>
        <p className="text-sm text-yellow-600 mt-1">Please configure a default template in Calling Form Master</p>
      </div>
    );
  }

  // Convert template fields to DynamicForm format
  const fields = template.fields.map(field => ({
    id: field.id,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    options: field.options
  }));

  return (
    <div>
      <DynamicForm
        fields={fields}
        initialData={initialData}
        autoSave={true}
        onAutoSave={handleAutoSave}
        onChange={handleChange}
        autoSaveDelay={1000}
        showSubmitButton={false}
        compact={true}
        twoColumns={true}
      />
    </div>
  );
};

export default CallingFormRenderer;
