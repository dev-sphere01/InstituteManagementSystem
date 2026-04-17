import { create } from 'zustand';
import CUPLEMS_API from '../services/CUPLEMS_API';

const useEmployeeStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  employees: [],
  currentEmployee: null,
  departments: [],
  positions: [],
  employeeTypes: [],
  locations: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0 },

  // ── Helpers ───────────────────────────────────────────────────────────────
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ── Employee CRUD ─────────────────────────────────────────────────────────
  fetchEmployees: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await CUPLEMS_API.get('/api/Employees', { params });
      set({ employees: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchEmployeeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await CUPLEMS_API.get(`/api/Employees/${id}`);
      set({ currentEmployee: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createEmployee: async (employeeData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await CUPLEMS_API.post('/api/Employees', employeeData);
      set((state) => ({ employees: [data, ...state.employees], loading: false }));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateEmployeeSection: async (id, section, payload) => {
    // section: 'basic' | 'department' | 'bank' | 'academic' | 'experience'
    set({ loading: true, error: null });
    try {
      const endpointMap = {
        basic: `/api/Employees/${id}`,
        department: `/api/Employees/${id}`,
        bank: `/api/EmpBankDetails`,
        academic: `/api/EmpAcadDetails`,
        experience: `/api/EmpProfDetails`,
      };
      const method = section === 'bank' || section === 'academic' || section === 'experience' ? 'post' : 'put';
      const { data } = await CUPLEMS_API[method](endpointMap[section], payload);
      if (section === 'basic' || section === 'department') {
        set({ currentEmployee: data, loading: false });
      } else {
        set({ loading: false });
      }
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  toggleEmployeeStatus: async (id) => {
    try {
      const { data } = await CUPLEMS_API.post(`/api/Employees/ToggleStatus/${id}`);
      set((state) => ({
        employees: state.employees.map((e) =>
          e.EmpID === id ? { ...e, IsActive: !e.IsActive } : e
        ),
      }));
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  checkDuplicate: async (fields) => {
    // fields: { mobile, aadhaar, email, accountNumber }
    try {
      const { data } = await CUPLEMS_API.get('/api/Employees/CheckDuplicate', { params: fields });
      return data; // { isDuplicate: bool, field: string }
    } catch {
      return { isDuplicate: false };
    }
  },

  // ── Masters ───────────────────────────────────────────────────────────────
  fetchDepartments: async () => {
    try {
      const { data } = await CUPLEMS_API.get('/api/Departments');
      set({ departments: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchPositions: async (deptId) => {
    try {
      const params = deptId ? { deptId } : {};
      const { data } = await CUPLEMS_API.get('/api/Positions', { params });
      set({ positions: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchEmployeeTypes: async () => {
    try {
      const { data } = await CUPLEMS_API.get('/api/EmpTypes');
      set({ employeeTypes: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchLocations: async () => {
    try {
      const { data } = await CUPLEMS_API.get('/api/Locations');
      set({ locations: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  createDepartment: async (dept) => {
    const { data } = await CUPLEMS_API.post('/api/Departments', dept);
    set((state) => ({ departments: [...state.departments, data] }));
    return data;
  },

  createPosition: async (pos) => {
    const { data } = await CUPLEMS_API.post('/api/Positions', pos);
    set((state) => ({ positions: [...state.positions, data] }));
    return data;
  },

  createEmployeeType: async (type) => {
    const { data } = await CUPLEMS_API.post('/api/EmpTypes', type);
    set((state) => ({ employeeTypes: [...state.employeeTypes, data] }));
    return data;
  },
}));

export default useEmployeeStore;
