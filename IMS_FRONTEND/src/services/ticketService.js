import API from './API';

const ticketService = {
  // Get all tickets with filtering and pagination
  getTickets: async (params = {}) => {
    return await API.get('/tickets', { params });
  },

  // Get aggregated stats
  getTicketStats: async () => {
    return await API.get('/tickets/stats');
  },

  // Get ticket by ID or Ticket Number
  getTicketById: async (id) => {
    return await API.get(`/tickets/${id}`);
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    return await API.post('/tickets', ticketData);
  },

  // Update ticket details
  updateTicket: async (id, ticketData) => {
    return await API.put(`/tickets/${id}`, ticketData);
  },

  // Update status (e.g. Open -> In Progress -> Resolved)
  updateTicketStatus: async (id, status, resolutionNotes = '') => {
    return await API.patch(`/tickets/${id}/status`, { status, resolutionNotes });
  },

  // Assign to individual employee or department
  assignTicket: async (id, assignedTo, department) => {
    return await API.patch(`/tickets/${id}/assign`, { assignedTo, department });
  },

  // Add discussion comment / internal note
  addComment: async (id, text, isInternal = false) => {
    return await API.post(`/tickets/${id}/comments`, { text, isInternal });
  },

  // Add subtask checklist item
  addSubtask: async (id, title) => {
    return await API.post(`/tickets/${id}/subtasks`, { title });
  },

  // Toggle subtask completion
  toggleSubtask: async (id, subtaskId, isCompleted) => {
    return await API.patch(`/tickets/${id}/subtasks/${subtaskId}`, { isCompleted });
  },

  // Remove subtask
  deleteSubtask: async (id, subtaskId) => {
    return await API.delete(`/tickets/${id}/subtasks/${subtaskId}`);
  },

  // Delete ticket
  deleteTicket: async (id) => {
    return await API.delete(`/tickets/${id}`);
  },
};

export default ticketService;
