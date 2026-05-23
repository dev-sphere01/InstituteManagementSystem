import API from './API';

const callingService = {
  // Lead management
  getLeads: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/calling/leads?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  getLeadById: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}`);
      return response;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  },

  createLead: async (leadData) => {
    try {
      const response = await API.post('/calling/leads', leadData);
      return response;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  updateLead: async (leadId, leadData, type = 'lead') => {
    try {
      let response;
      if (type === 'application') {
        // For applications, use the calling applications endpoint (for assigned employees)
        response = await API.put(`/calling/applications/${leadId}`, {
          status: leadData.status,
          remarks: leadData.remarks
        });
      } else {
        // For leads, use the calling leads endpoint
        response = await API.put(`/calling/leads/${leadId}`, leadData);
      }
      return response;
    } catch (error) {
      console.error('Error updating lead/application:', error);
      throw error;
    }
  },

  deleteLead: async (leadId) => {
    try {
      const response = await API.delete(`/calling/leads/${leadId}`);
      return response;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkImportLeads: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/calling/leads/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error importing leads:', error);
      throw error;
    }
  },

  bulkCreateLeads: async (leadsData) => {
    try {
      // For large datasets, split into chunks to avoid request size limits
      const CHUNK_SIZE = 1000; // Process 1000 leads at a time
      
      if (leadsData.length <= CHUNK_SIZE) {
        // Small dataset, send all at once
        const response = await API.post('/calling/leads/bulk-create', {
          leads: leadsData
        });
        return response;
      }

      // Large dataset, process in chunks
      console.log(`Processing ${leadsData.length} leads in chunks of ${CHUNK_SIZE}`);
      
      const totalChunks = Math.ceil(leadsData.length / CHUNK_SIZE);
      const combinedResults = {
        total: leadsData.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, leadsData.length);
        const chunk = leadsData.slice(start, end);

        console.log(`Processing chunk ${i + 1}/${totalChunks} (${chunk.length} leads)`);

        try {
          const response = await API.post('/calling/leads/bulk-create', {
            leads: chunk
          });

          const chunkResults = response.results || response.data?.results || response.data || {};
          combinedResults.success += chunkResults.success;
          combinedResults.failed += chunkResults.failed;
          
          // Adjust row numbers for errors to reflect original positions
          if (chunkResults.errors) {
            chunkResults.errors.forEach(error => {
              combinedResults.errors.push({
                ...error,
                row: error.row + start // Adjust row number to original position
              });
            });
          }

        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          
          // Mark all leads in this chunk as failed
          combinedResults.failed += chunk.length;
          chunk.forEach((_, index) => {
            combinedResults.errors.push({
              row: start + index + 1,
              error: chunkError.response?.data?.error || chunkError.message || 'Network error'
            });
          });
        }
      }

      return {
        message: 'Bulk create completed',
        results: combinedResults
      };

    } catch (error) {
      console.error('Error bulk creating leads:', error);
      throw error;
    }
  },

  assignLeads: async (leadIds, staffId, forceReassign = false) => {
    try {
      const response = await API.post('/calling/leads/assign', {
        leadIds,
        staffId,
        forceReassign
      });
      return response;
    } catch (error) {
      console.error('Error assigning leads:', error);
      throw error;
    }
  },

  // Call management
  startCall: async (leadId) => {
    try {
      const response = await API.post(`/calling/leads/${leadId}/start-call`);
      return response;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  },

  endCall: async (leadId, callData) => {
    try {
      const response = await API.post(`/calling/leads/${leadId}/end-call`, callData);
      return response;
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  },

  updateCallStatus: async (leadId, statusData) => {
    try {
      const response = await API.put(`/calling/leads/${leadId}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  },

  // Master data
  getServices: async () => {
    try {
      // Fetch service types from Service Master Management
      console.log('Fetching services from Service Master...');
      const response = await API.get('/service-master/service-types', {
        params: { isActive: 'true' } // Only fetch active service types
      });
      console.log('Service Master API response:', response);
      
      // Service Master API returns { success: true, data: [...] }
      const services = response?.data || response;
      console.log('Extracted services:', services);
      
      return services;
    } catch (error) {
      console.error('Error fetching services from Service Master:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getServiceSubcategories: async (serviceId) => {
    try {
      const response = await API.get(`/calling/services/${serviceId}/subcategories`);
      return response;
    } catch (error) {
      console.error('Error fetching service subcategories:', error);
      throw error;
    }
  },

  getServiceProviders: async (serviceId) => {
    try {
      const response = await API.get(`/calling/service-providers?serviceId=${serviceId}`);
      return response;
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  },

  getStaff: async () => {
    try {
      const response = await API.get('/calling/staff');
      return response;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  // Get available status transitions for a lead
  getLeadStatusTransitions: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}/status-transitions`);
      return response;
    } catch (error) {
      console.error('Error fetching status transitions:', error);
      throw error;
    }
  },

  // Get call history for a lead
  getLeadCallHistory: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}/call-history`);
      return response;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw error;
    }
  },

  // Get calling stats for current user
  getMyStats: async () => {
    try {
      const response = await API.get('/calling/my-stats');
      return response;
    } catch (error) {
      console.error('Error fetching calling stats:', error);
      throw error;
    }
  },

  // Get next assigned lead for current user
  getNextAssignedLead: async (currentLeadId, type = 'lead') => {
    try {
      const response = await API.get(`/calling/leads/${currentLeadId}/next-assigned`, {
        params: { type }
      });
      return response;
    } catch (error) {
      console.error('Error fetching next assigned lead:', error);
      throw error;
    }
  },

  // Reassign lead/application back to admin
  reassignToAdmin: async (itemId, reason, type = 'lead') => {
    try {
      const response = await API.post(`/calling/leads/${itemId}/reassign-to-admin`, { reason, type });
      return response;
    } catch (error) {
      console.error('Error reassigning to admin:', error);
      throw error;
    }
  },

  // Send form link via email
  sendFormEmail: async (leadId, leadEmail, leadName, formLink) => {
    try {
      const response = await API.post('/calling/send-form-email', {
        leadId,
        leadEmail,
        leadName,
        formLink
      });
      return response;
    } catch (error) {
      console.error('Error sending form email:', error);
      throw error;
    }
  },

  // Reports and analytics
  getCallReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/calling/reports?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching call reports:', error);
      throw error;
    }
  }
};

export default callingService;
