import API from './API';

const workflowService = {
  // Tasks
  getTasks: async (params = {}) => {
    return API.get('/tasks', { params });
  },
  getTaskById: async (id) => {
    return API.get(`/tasks/${id}`);
  },
  updateTask: async (id, payload) => {
    return API.patch(`/tasks/${id}`, payload);
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
  getAvailableTasks: async () => {
    return API.get('/tasks/available');
  },
  getMyTasks: async () => {
    return API.get('/tasks/my');
  },
  claimTask: async (id) => {
    return API.post(`/tasks/${id}/claim`);
  },
  completeTask: async (id, note = '', overrideReason = '') => {
    return API.post(`/tasks/${id}/complete`, { note, overrideReason });
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
  },
  // Fees
  getFeeSummary: async (params = {}) => {
    return API.get('/fees', { params });
  },
  createFeePlan: async (payload) => {
    return API.post('/fees', payload);
  },
  payInstallment: async (installmentId, amount, method, reference, note, paymentDate) => {
    return API.patch(`/fees/installments/${installmentId}/pay`, { amount, method, reference, note, paymentDate });
  },
  directPay: async (payload) => {
    return API.post('/fees/direct-pay', payload);
  }
};

export default workflowService;
