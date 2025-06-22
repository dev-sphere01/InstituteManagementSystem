import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '../services/API';

const useEnquiryStore = create(
  devtools((set, get) => ({
    enquiries: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      course: '',
      dateFrom: '',
      dateTo: '',
    },
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 })),
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit }),
    fetchEnquiries: async (params = {}) => {
      set({ loading: true, error: null });
      try {
        const { filters, page, limit } = get();
        // Remove empty filters so backend returns all data if no filter is set
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== '')
        );
        const res = await API.get('/enquiry', {
          params: { ...cleanFilters, page, limit, ...params },
        });
        set({
          enquiries: res.data.data,
          total: res.data.total,
          totalPages: res.data.totalPages,
          loading: false,
        });
      } catch (error) {
        set({ error: error.message || 'Failed to fetch enquiries', loading: false });
      }
    },
    clearError: () => set({ error: null }),
  }))
);

export default useEnquiryStore;
