import API from './API';

const studentService = {
  list: async (params = {}) => API.get('/students', { params }),
  getById: async (id) => API.get(`/students/${id}`),
  update: async (id, data) => API.put(`/students/${id}`, data)
};

export default studentService;
