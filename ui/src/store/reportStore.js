import { create } from 'zustand';

const useReportStore = create((set) => ({
  selectedFields: [],
  filters: {
    status: '',
    startDate: '',
    endDate: '',
  },
  reportData: null,
  currentPage: 1,
  pageSize: 25,
  showSidebar: true,
  sortConfig: { column: null, direction: 'asc' },
  searchText: '',

  setSelectedFields: (fields) => set((state) => ({ 
    selectedFields: typeof fields === 'function' ? fields(state.selectedFields) : fields 
  })),
  setFilters: (filters) => set((state) => ({ 
    filters: typeof filters === 'function' ? filters(state.filters) : filters 
  })),
  setReportData: (data) => set((state) => ({ 
    reportData: typeof data === 'function' ? data(state.reportData) : data 
  })),
  setCurrentPage: (page) => set((state) => ({ 
    currentPage: typeof page === 'function' ? page(state.currentPage) : page 
  })),
  setPageSize: (size) => set((state) => ({ 
    pageSize: typeof size === 'function' ? size(state.pageSize) : size 
  })),
  setShowSidebar: (show) => set((state) => ({ 
    showSidebar: typeof show === 'function' ? show(state.showSidebar) : show 
  })),
  setSortConfig: (config) => set((state) => ({ 
    sortConfig: typeof config === 'function' ? config(state.sortConfig) : config 
  })),
  setSearchText: (text) => set((state) => ({ 
    searchText: typeof text === 'function' ? text(state.searchText) : text 
  })),

  resetReport: () => set({
    selectedFields: [],
    filters: { status: '', startDate: '', endDate: '' },
    reportData: null,
    currentPage: 1,
    pageSize: 25,
    sortConfig: { column: null, direction: 'asc' },
    searchText: '',
  }),
}));

export default useReportStore;
