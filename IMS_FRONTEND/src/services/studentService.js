import API from './API';

const studentService = {
  list: async (params = {}) => API.get('/students', { params }),
  getById: async (id) => API.get(`/students/${id}`)
};

export default studentService;
