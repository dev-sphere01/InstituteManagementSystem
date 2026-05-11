import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';

const IncrementService = {
    getAllIncrements: async (params = {}) => {
        try {
            const response = await API.get('/EmpIncrements', { params });
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    getEmployeeIncrements: async (empId) => {
        try {
            const response = await API.get(`/EmpIncrements/Employee/${empId}`);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    bulkUploadIncrements: async (data, sessionId) => {
        try {
            const response = await API.post('/EmpIncrements/BulkUpload', data, {
                params: { sessionId }
            });
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    approveIncrement: async (id) => {
        try {
            const response = await API.post(`/EmpIncrements/Approve/${id}`);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    bulkApproveIncrements: async (ids) => {
        try {
            const response = await API.post('/EmpIncrements/BulkApprove', ids);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    bulkDeleteIncrements: async (ids) => {
        try {
            const response = await API.post('/EmpIncrements/BulkDelete', ids);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    bulkRollbackIncrements: async (ids) => {
        try {
            const response = await API.post('/EmpIncrements/BulkRollback', ids);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },
    
    manualProcess: async () => {
        try {
            const response = await API.post('/EmpIncrements/ManualProcess');
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    deleteIncrement: async (id) => {
        try {
            const response = await API.delete(`/EmpIncrements/${id}`);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    },

    rollbackIncrement: async (id) => {
        try {
            const response = await API.post(`/EmpIncrements/Rollback/${id}`);
            return response.data;
        } catch (error) {
            throw ErrorHandler.handle(error);
        }
    }
};

export default IncrementService;
