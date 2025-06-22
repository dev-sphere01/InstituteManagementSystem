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
      console.log('fetchEnquiries called');
      set({ loading: true, error: null });
      try {
        const { filters, page, limit } = get();
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const requestParams = { ...cleanFilters, page, limit, ...params };
        console.log('API GET /enquiry params:', requestParams);
        const res = await API.get('/enquiry', { params: requestParams });
        console.log('Full API response:', res.data);
        // Defensive: ensure enquiries is always an array
        let enquiriesArr = [];
        if (Array.isArray(res.data?.data)) {
          enquiriesArr = res.data.data;
        } else if (Array.isArray(res.data)) {
          enquiriesArr = res.data;
          console.warn('API response missing .data, using root array:', res.data);
        } else {
          console.error('API response does not contain an array of enquiries:', res.data);
        }
        console.log('Setting enquiries to:', enquiriesArr);
        set({
          enquiries: enquiriesArr,
          total: res.data.total || 0,
          totalPages: res.data.totalPages || 1,
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
