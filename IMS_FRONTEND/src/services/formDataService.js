import API from './API';

const formDataService = {
  submitPublicForm: (payload) => API.post('/form-data/public/submit', payload)
};

export default formDataService;
