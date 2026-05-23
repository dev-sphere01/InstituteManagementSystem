import API from './API';

const unwrap = (response) => response?.data || response;

const callingFormService = {
  getTemplates: async (params = {}) => unwrap(await API.get('/calling-forms', { params })),
  getTemplateById: async (id) => unwrap(await API.get(`/calling-forms/${id}`)),
  getDefaultTemplate: async () => unwrap(await API.get('/calling-forms/default')),
  createTemplate: async (data) => unwrap(await API.post('/calling-forms', data)),
  updateTemplate: async (id, data) => unwrap(await API.put(`/calling-forms/${id}`, data)),
  deleteTemplate: async (id) => unwrap(await API.delete(`/calling-forms/${id}`)),
  setDefaultTemplate: async (id) => unwrap(await API.patch(`/calling-forms/${id}/set-default`)),

  saveFormData: async (data) => unwrap(await API.post('/calling-forms/data', data)),
  saveFormDataWithFiles: async (formData) =>
    unwrap(await API.post('/calling-forms/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })),
  getFormData: async (leadId) => unwrap(await API.get(`/calling-forms/data/${leadId}`))
};

export default callingFormService;
