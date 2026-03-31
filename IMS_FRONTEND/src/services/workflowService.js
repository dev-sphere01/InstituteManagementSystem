import API from './API';

const workflowService = {
  // Tasks
  getTasks: async (params = {}) => {
    return API.get('/tasks', { params });
  },
  getTaskById: async (id) => {
    return API.get(`/tasks/${id}`);
  },
  updateTaskStatus: async (id, status, note = '') => {
    return API.patch(`/tasks/${id}/status`, { status, note });
  },
  assignTask: async (id, payload) => {
    return API.patch(`/tasks/${id}/assign`, payload);
  },
  getTaskHistory: async (id) => {
    return API.get(`/tasks/${id}/history`);
  },

  // Workflow templates
  getTemplates: async (params = {}) => {
    return API.get('/workflow-templates', { params });
  },
  getAdmissions: async (params = {}) => {
    return API.get('/admissions', { params });
  },
  getTemplateById: async (id) => {
    return API.get(`/workflow-templates/${id}`);
  },
  createTemplate: async (payload) => {
    return API.post('/workflow-templates', payload);
  },
  updateTemplate: async (id, payload) => {
    return API.put(`/workflow-templates/${id}`, payload);
  },
  setTemplateActive: async (id, isActive) => {
    return API.patch(`/workflow-templates/${id}/active`, { isActive });
  },

  // Workflow instances
  createWorkflow: async (payload) => {
    return API.post('/workflows', payload);
  },
  getWorkflowsByTarget: async (params = {}) => {
    return API.get('/workflows', { params });
  },
  getWorkflowById: async (id) => {
    return API.get(`/workflows/${id}`);
  }
};

export default workflowService;
