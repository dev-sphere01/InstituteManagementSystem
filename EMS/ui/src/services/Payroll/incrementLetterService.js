import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';

const IncrementLetterService = {
    getSessions: async () => {
        try {
            const response = await API.get('/ReviewSessions');
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    getEmployeesByDepartment: async (deptId) => {
        try {
            const response = await API.get(`/Departments/GetEmployeebydepartment?id=${deptId}`);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    generateLetters: async (params) => {
        try {
            const response = await API.get('/EmpIncrements/GenerateLetters', { params });
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    getTemplates: async () => {
        try {
            const response = await API.get('/EMSSettings/LetterTemplates');
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    saveTemplate: async (template) => {
        try {
            if (template.TemplateID) {
                return await API.put(`/EMSSettings/LetterTemplates/${template.TemplateID}`, template);
            }
            return await API.post('/EMSSettings/LetterTemplates', template);
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    deleteTemplate: async (id) => {
        try {
            return await API.delete(`/EMSSettings/LetterTemplates/${id}`);
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    getSignatories: async () => {
        try {
            const response = await API.get('/EMSSettings/SignatorySettings');
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    saveSignatory: async (formData) => {
        try {
            const id = formData.get('signatoryID');
            if (id && id !== '0') {
                return await API.put(`/EMSSettings/SignatorySettings/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            return await API.post('/EMSSettings/SignatorySettings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    deleteSignatory: async (id) => {
        try {
            return await API.delete(`/EMSSettings/SignatorySettings/${id}`);
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    }
};

export default IncrementLetterService;
