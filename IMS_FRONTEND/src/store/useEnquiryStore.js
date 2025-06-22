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
    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
    fetchEnquiries: async (params = {}) => {
      set({ loading: true, error: null });
      try {
        // You may want to adjust the API endpoint as needed
        const res = await API.get('/enquiry', { params: { ...get().filters, ...params } });
        set({ enquiries: res.data.data, loading: false });
      } catch (error) {
        set({ error: error.message || 'Failed to fetch enquiries', loading: false });
      }
    },
    clearError: () => set({ error: null }),
  }))
);

export default useEnquiryStore;
