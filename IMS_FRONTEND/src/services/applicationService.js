import API from './API';

const applicationService = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await API.get('/applications/test');
      return response;
    } catch (error) {
      console.error('Error testing API connection:', error);
      throw error;
    }
  },

  // Submit a new application
  submitApplication: async (applicationData) => {
    try {
      const response = await API.post('/applications', applicationData);
      return response;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplication: async (applicationId) => {
    try {
      const response = await API.get(`/applications/${applicationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Get applications with filters (admin only)
  getApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/applications/admin/list?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Update application status (admin only)
  updateApplicationStatus: async (applicationId, status, note = '') => {
    try {
      const response = await API.put(`/applications/${applicationId}/status`, {
        status,
        note
      });
      return response;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Add note to application (admin only)
  addNote: async (applicationId, note) => {
    try {
      const response = await API.post(`/applications/${applicationId}/notes`, {
        note
      });
      return response;
    } catch (error) {
      console.error('Error adding note to application:', error);
      throw error;
    }
  },

  // Get application statistics (admin only)
  getApplicationStats: async () => {
    try {
      const response = await API.get('/applications/admin/stats');
      return response;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },

  // Get loan requirements for document upload
  getLoanRequirements: async (loanType) => {
    try {
      const response = await API.get(`/applications/loan-requirements/${loanType}`);
      return response;
    } catch (error) {
      console.error('Error fetching loan requirements:', error);
      throw error;
    }
  },

  // Upload documents for an application
  uploadDocuments: async (applicationId, files, documentTypes) => {
    try {
      const formData = new FormData();

      // Add files to form data
      files.forEach((file) => {
        formData.append('documents', file);
      });

      // Add document types
      if (documentTypes) {
        documentTypes.forEach((type) => {
          formData.append('documentTypes', type);
        });
      }

      const response = await API.post(`/applications/${applicationId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  },

  // Upload single document during application process
  uploadDocument: async (formData) => {
    try {
      const response = await API.post('/applications/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Assign application to staff member (admin only)
  assignApplication: async (applicationId, staffId) => {
    try {
      const response = await API.post(`/applications/${applicationId}/assign`, {
        staffId
      });
      return response;
    } catch (error) {
      console.error('Error assigning application:', error);
      throw error;
    }
  },

  // Reassign application to different staff member (admin only)
  reassignApplication: async (applicationId, staffId) => {
    try {
      const response = await API.put(`/applications/${applicationId}/reassign`, {
        staffId
      });
      return response;
    } catch (error) {
      console.error('Error reassigning application:', error);
      throw error;
    }
  },

  // Bulk assign applications to staff member (admin only)
  bulkAssignApplications: async (applicationIds, staffId) => {
    try {
      const response = await API.post('/applications/bulk-assign', {
        applicationIds,
        staffId
      });
      return response;
    } catch (error) {
      console.error('Error bulk assigning applications:', error);
      throw error;
    }
  },

  // Get staff members for assignment (admin only)
  getStaffForAssignment: async () => {
    try {
      const response = await API.get('/applications/admin/staff');
      return response;
    } catch (error) {
      console.error('Error fetching staff for assignment:', error);
      throw error;
    }
  },

  // Get applications assigned to current user (employee)
  getMyAssignedApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/applications/employee/assigned?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching assigned applications:', error);
      throw error;
    }
  }
};

export default applicationService;
