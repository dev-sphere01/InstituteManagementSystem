import { create } from 'zustand';

const useCallingStore = create((set, get) => ({
  // Lead data state
  leads: [],
  currentLead: null,
  isLoading: false,
  
  // Calling session state
  isCallSessionActive: false,
  sessionData: null,
  hasUnsavedChanges: false,
  callingRoute: null, // Store the route to return to when call is active
  
  // Filter and pagination state
  filters: {
    status: 'all', // all, assigned, unassigned, pending, completed
    assignedTo: '',
    service: '',
    dateRange: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  
  // Services and staff data
  services: [],
  serviceProviders: [],
  staff: [],
  
  // Actions for leads management
  setLeads: (leads) => set({ leads }),
  
  addLead: (lead) => set((state) => ({
    leads: [lead, ...state.leads]
  })),
  
  updateLead: (leadId, updates) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    ),
    currentLead: state.currentLead?.id === leadId 
      ? { ...state.currentLead, ...updates } 
      : state.currentLead
  })),
  
  deleteLead: (leadId) => set((state) => ({
    leads: state.leads.filter(lead => lead.id !== leadId)
  })),
  
  // Bulk operations
  assignLeadsToStaff: (leadIds, staffId) => set((state) => ({
    leads: state.leads.map(lead => 
      leadIds.includes(lead.id) 
        ? { ...lead, assignedTo: staffId, status: 'assigned' }
        : lead
    )
  })),
  
  // Current lead management
  setCurrentLead: (lead) => set({ currentLead: lead }),
  
  // UI-only call session management (no backend integration)
  startCallSession: (leadId, route = null, pageState = null) => {
    const state = get();
    const lead = state.currentLead;
    
    if (!lead) return;
    
    // Store session data only for UI state management
    const sessionData = {
      leadId,
      startTime: new Date().toISOString(),
      isActive: true,
      route: route || window.location.pathname + window.location.search,
      pageState: pageState || {} // Store any additional page state
    };
    
    sessionStorage.setItem('callingSession', JSON.stringify(sessionData));
    
    set({
      isCallSessionActive: true,
      sessionData,
      hasUnsavedChanges: false,
      callingRoute: sessionData.route
    });
  },
  
  // Update session with page state
  updateCallSessionState: (pageState) => {
    const state = get();
    if (!state.isCallSessionActive || !state.sessionData) return;
    
    const updatedSessionData = {
      ...state.sessionData,
      pageState: {
        ...state.sessionData.pageState,
        ...pageState
      }
    };
    
    sessionStorage.setItem('callingSession', JSON.stringify(updatedSessionData));
    
    set({
      sessionData: updatedSessionData,
      hasUnsavedChanges: true
    });
  },
  
  updateSessionData: (updates) => {
    const state = get();
    if (!state.isCallSessionActive) return;
    
    set({ hasUnsavedChanges: true });
  },
  
  endCallSession: () => {
    // Clean up UI session state only
    sessionStorage.removeItem('callingSession');
    
    set({
      isCallSessionActive: false,
      sessionData: null,
      hasUnsavedChanges: false,
      callingRoute: null
    });
  },
  
  // Restore session from sessionStorage (on page reload)
  restoreSession: () => {
    const sessionData = sessionStorage.getItem('callingSession');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        set({
          isCallSessionActive: true,
          sessionData: parsed,
          hasUnsavedChanges: true,
          callingRoute: parsed.route || null
        });
        window.addEventListener('beforeunload', get().handleBeforeUnload);
      } catch (error) {
        console.error('Error restoring calling session:', error);
        sessionStorage.removeItem('callingSession');
      }
    }
  },
  
  // Handle beforeunload event
  handleBeforeUnload: (event) => {
    const state = get();
    if (state.isCallSessionActive && state.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes in your calling session. Are you sure you want to leave?';
      return event.returnValue;
    }
  },
  
  // Filters and pagination
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  // Master data
  setServices: (services) => set({ services }),
  setServiceProviders: (serviceProviders) => set({ serviceProviders }),
  setStaff: (staff) => set({ staff }),
  
  // Loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Reset store
  reset: () => set({
    leads: [],
    currentLead: null,
    isLoading: false,
    isCallSessionActive: false,
    sessionData: null,
    hasUnsavedChanges: false,
    filters: {
      status: 'all',
      assignedTo: '',
      service: '',
      dateRange: null
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  })
}));

export default useCallingStore;