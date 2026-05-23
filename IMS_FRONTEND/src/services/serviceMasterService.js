import API from './API';

const serviceMasterService = {
  // Service Types
  getServiceTypes: async (params = {}) => {
    const response = await API.get('/service-master/service-types', { params });
    return response;
  },

  getServiceType: async (id) => {
    const response = await API.get(`/service-master/service-types/${id}`);
    return response;
  },

  createServiceType: async (data) => {
    const response = await API.post('/service-master/service-types', data);
    return response;
  },

  updateServiceType: async (id, data) => {
    const response = await API.put(`/service-master/service-types/${id}`, data);
    return response;
  },

  deleteServiceType: async (id) => {
    const response = await API.delete(`/service-master/service-types/${id}`);
    return response;
  },

  // Subcategories
  getSubcategories: async (params = {}) => {
    const response = await API.get('/service-master/subcategories', { params });
    return response;
  },

  getSubcategory: async (id) => {
    const response = await API.get(`/service-master/subcategories/${id}`);
    return response;
  },

  createSubcategory: async (data) => {
    const response = await API.post('/service-master/subcategories', data);
    return response;
  },

  updateSubcategory: async (id, data) => {
    const response = await API.put(`/service-master/subcategories/${id}`, data);
    return response;
  },

  deleteSubcategory: async (id) => {
    const response = await API.delete(`/service-master/subcategories/${id}`);
    return response;
  },

  // Service Providers
  getServiceProviders: async (params = {}) => {
    const response = await API.get('/service-master/service-providers', { params });
    return response;
  },

  getServiceProvider: async (id) => {
    const response = await API.get(`/service-master/service-providers/${id}`);
    return response;
  },

  createServiceProvider: async (data) => {
    const response = await API.post('/service-master/service-providers', data);
    return response;
  },

  updateServiceProvider: async (id, data) => {
    const response = await API.put(`/service-master/service-providers/${id}`, data);
    return response;
  },

  deleteServiceProvider: async (id) => {
    const response = await API.delete(`/service-master/service-providers/${id}`);
    return response;
  }
};

export default serviceMasterService;
