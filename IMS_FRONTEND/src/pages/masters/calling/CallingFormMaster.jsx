import { useEffect, useRef, useState } from 'react';
import { Copy, Link as LinkIcon } from 'lucide-react';
import callingFormService from '@/services/callingFormService';
import FormBuilder from '@/components/common/FormBuilder';
import { useNotification } from '@/services/NotificationService';

const CallingFormMaster = () => {
  const notify = useNotification();
  const [templateId, setTemplateId] = useState(null);
  const [initialFields, setInitialFields] = useState([]);
  const [initialMetadata, setInitialMetadata] = useState({
    name: 'Calling Form',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState({ fields: [], metadata: initialMetadata });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const storageKey = 'ims_calling_form_link';
  const expiryKey = 'ims_calling_form_link_expires';
  const lastConfigRef = useRef('');

  useEffect(() => {
    loadTemplate();
  }, []);
  
  useEffect(() => {
    const storedLink = localStorage.getItem(storageKey);
    const storedExpiry = localStorage.getItem(expiryKey);
    if (storedLink) {
      setGeneratedLink(storedLink);
    }
    if (storedExpiry) {
      setLinkExpiresAt(storedExpiry);
    }
  }, []);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const templates = await callingFormService.getTemplates();

      if (templates.length > 0) {
        const template = templates[0];
        setTemplateId(template._id);
        setInitialFields(template.fields.map((field) => ({ ...field })));
        setInitialMetadata({
          name: template.name,
          description: template.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData) => {
    const payload = {
      ...formData,
      isActive: true
    };

    if (templateId) {
      await callingFormService.updateTemplate(templateId, payload);
    } else {
      const result = await callingFormService.createTemplate(payload);
      setTemplateId(result.template?._id || result._id);
    }
  };

  const generateLink = async () => {
    const fields = currentConfig.fields || [];

    if (fields.length === 0) {
      notify('At least one field is required', 'warning');
      return;
    }

    const invalidFields = fields.filter((field) => !field.label?.trim());
    if (invalidFields.length > 0) {
      notify('All fields must have labels', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const payload = {
        templateId,
        name: currentConfig.metadata?.name || 'Calling Form',
        description: currentConfig.metadata?.description || '',
        fields,
        createdAt: new Date().toISOString(),
        expiresAt
      };

      const encrypted = btoa(JSON.stringify(payload));
      const link = `${window.location.origin}/form/${encrypted}`;
      setGeneratedLink(link);
      setLinkExpiresAt(expiresAt);
      localStorage.setItem(storageKey, link);
      localStorage.setItem(expiryKey, expiresAt);
      lastConfigRef.current = JSON.stringify({
        fields,
        metadata: currentConfig.metadata || {}
      });
      notify('Form link generated successfully', 'success');
    } catch (error) {
      console.error('Error generating link:', error);
      notify('Failed to generate link', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    const effectiveLink = generatedLink || localStorage.getItem(storageKey) || '';
    if (!effectiveLink) return;
    try {
      await navigator.clipboard.writeText(effectiveLink);
      notify('Link copied to clipboard', 'success');
    } catch (error) {
      console.error('Failed to copy link:', error);
      notify('Failed to copy link', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calling Form Master</h1>
        <p className="text-gray-600 mt-1">Configure the form used across the IMS</p>
      </div>

      <FormBuilder
        initialFields={initialFields}
        initialMetadata={initialMetadata}
        onSave={handleSave}
        saveButtonText="Save Form"
        showMetadata={false}
        showPreview={true}
        onChange={(config) => {
          setCurrentConfig({
            fields: config.fields || [],
            metadata: config.metadata || initialMetadata
          });
          const nextHash = JSON.stringify({
            fields: config.fields || [],
            metadata: config.metadata || {}
          });
          if (generatedLink && lastConfigRef.current && nextHash !== lastConfigRef.current) {
            setGeneratedLink('');
            setLinkExpiresAt('');
            localStorage.removeItem(storageKey);
            localStorage.removeItem(expiryKey);
          }
          lastConfigRef.current = nextHash;
        }}
      />

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Share Form</h2>
            <p className="text-sm text-gray-600">Generate a public link to share this form</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateLink}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Link'}
            </button>
            <button
              onClick={copyLink}
              disabled={!generatedLink}
              className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
          </div>
        </div>

        {(generatedLink || localStorage.getItem(storageKey)) ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedLink || localStorage.getItem(storageKey) || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            {linkExpiresAt && (
              <p className="text-xs text-gray-500">
                Link expires on {new Date(linkExpiresAt).toLocaleString()}.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Generate a link after adding form fields.</p>
        )}
      </div>
    </div>
  );
};

export default CallingFormMaster;
