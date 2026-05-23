import API from './API';

const dynamicFormService = {
  /**
   * Submit a dynamic form
   * @param {Object} submissionData - Form submission data
   * @returns {Promise}
   */
  submitForm: async (submissionData) => {
    try {
      const response = await API.post('/dynamic-forms/submit', submissionData);
      return response;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  /**
   * Check if a lead has already submitted a form
   * @param {string} leadId - Lead ID
   * @returns {Promise}
   */
  checkSubmission: async (leadId) => {
    try {
      const response = await API.get(`/dynamic-forms/check/${leadId}`);
      return response;
    } catch (error) {
      console.error('Error checking submission:', error);
      throw error;
    }
  },

  /**
   * Get form submission by lead ID
   * @param {string} leadId - Lead ID
   * @returns {Promise}
   */
  getSubmissionByLeadId: async (leadId) => {
    try {
      const response = await API.get(`/dynamic-forms/submission/${leadId}`);
      return response;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  /**
   * Get all form submissions (admin)
   * @param {Object} params - Query parameters (page, limit, status, leadId)
   * @returns {Promise}
   */
  getAllSubmissions: async (params = {}) => {
    try {
      const response = await API.get('/dynamic-forms/submissions', { params });
      return response;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  /**
   * Review a form submission
   * @param {string} submissionId - Submission ID
   * @param {Object} reviewData - Review data (status, reviewNotes)
   * @returns {Promise}
   */
  reviewSubmission: async (submissionId, reviewData) => {
    try {
      const response = await API.put(`/dynamic-forms/submission/${submissionId}/review`, reviewData);
      return response;
    } catch (error) {
      console.error('Error reviewing submission:', error);
      throw error;
    }
  },

  /**
   * Delete a form submission
   * @param {string} submissionId - Submission ID
   * @returns {Promise}
   */
  deleteSubmission: async (submissionId) => {
    try {
      const response = await API.delete(`/dynamic-forms/submission/${submissionId}`);
      return response;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

export default dynamicFormService;
