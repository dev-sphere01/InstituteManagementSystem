import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '../services/API';

const useCrmStore = create(
  devtools((set, get) => ({
    // Leads
    leads: [],
    leadsTotal: 0,
    leadsPage: 1,
    leadsPages: 1,
    currentLead: null,
    pipelineStats: null,
    leadsLoading: false,

    // Campaigns
    campaigns: [],
    campaignROI: [],
    overallROI: null,
    campaignsLoading: false,

    error: null,
    setError: (e) => set({ error: e }),

    // ── Leads ────────────────────────────────────────────────────────────────
    fetchLeads: async (params = {}) => {
      set({ leadsLoading: true, error: null });
      try {
        const res = await API.crm.leads.getAll(params);
        set({
          leads: res.leads || [],
          leadsTotal: res.total || 0,
          leadsPage: res.page || 1,
          leadsPages: res.pages || 1,
          leadsLoading: false,
        });
      } catch (e) {
        set({ error: e.response?.data?.message || e.message, leadsLoading: false });
      }
    },

    fetchLeadById: async (id) => {
      set({ leadsLoading: true, error: null });
      try {
        const res = await API.crm.leads.getById(id);
        set({ currentLead: res.data, leadsLoading: false });
        return res.data;
      } catch (e) {
        set({ error: e.response?.data?.message || e.message, leadsLoading: false });
      }
    },

    createLead: async (data) => {
      const res = await API.crm.leads.create(data);
      set(s => ({ leads: [res.data, ...s.leads], leadsTotal: s.leadsTotal + 1 }));
      return res.data;
    },

    updateLead: async (id, data) => {
      const res = await API.crm.leads.update(id, data);
      set(s => ({
        leads: s.leads.map(l => l._id === id ? res.data : l),
        currentLead: s.currentLead?._id === id ? res.data : s.currentLead,
      }));
      return res.data;
    },

    deleteLead: async (id) => {
      await API.crm.leads.delete(id);
      set(s => ({ leads: s.leads.filter(l => l._id !== id), leadsTotal: s.leadsTotal - 1 }));
    },

    addInteraction: async (leadId, data) => {
      const res = await API.crm.leads.addInteraction(leadId, data);
      set(s => ({
        currentLead: s.currentLead?._id === leadId ? res.data : s.currentLead,
        leads: s.leads.map(l => l._id === leadId ? res.data : l),
      }));
      return res.data;
    },

    reassignLead: async (leadId, assignedTo) => {
      const res = await API.crm.leads.reassign(leadId, assignedTo);
      set(s => ({
        leads: s.leads.map(l => l._id === leadId ? res.data : l),
        currentLead: s.currentLead?._id === leadId ? res.data : s.currentLead,
      }));
      return res.data;
    },

    bulkImport: async (file) => {
      const res = await API.crm.leads.bulkImport(file);
      await get().fetchLeads();
      return res;
    },

    fetchPipelineStats: async (params = {}) => {
      const res = await API.crm.leads.getPipelineStats(params);
      set({ pipelineStats: res.data });
    },

    runEscalation: async () => {
      const res = await API.crm.leads.runEscalation();
      return res;
    },

    // ── Campaigns ────────────────────────────────────────────────────────────
    fetchCampaigns: async (params = {}) => {
      set({ campaignsLoading: true, error: null });
      try {
        const res = await API.crm.campaigns.getAll(params);
        set({ campaigns: res.data || [], campaignsLoading: false });
      } catch (e) {
        set({ error: e.response?.data?.message || e.message, campaignsLoading: false });
      }
    },

    createCampaign: async (data) => {
      const res = await API.crm.campaigns.create(data);
      set(s => ({ campaigns: [res.data, ...s.campaigns] }));
      return res.data;
    },

    updateCampaign: async (id, data) => {
      const res = await API.crm.campaigns.update(id, data);
      set(s => ({ campaigns: s.campaigns.map(c => c._id === id ? res.data : c) }));
      return res.data;
    },

    deleteCampaign: async (id) => {
      await API.crm.campaigns.delete(id);
      set(s => ({ campaigns: s.campaigns.filter(c => c._id !== id) }));
    },

    fetchCampaignROI: async (params = {}) => {
      const res = await API.crm.campaigns.getROI(params);
      set({ campaignROI: res.data || [] });
    },

    fetchOverallROI: async () => {
      const res = await API.crm.campaigns.getOverallROI();
      set({ overallROI: res.data });
    },
  }), { name: 'crm-store' })
);

export default useCrmStore;
