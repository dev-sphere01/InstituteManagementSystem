import { create } from 'zustand';
import CUPLEMS_API from '../services/CUPLEMS_API';
import API from '../services/API';

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
      if (Array.isArray(data) && data.length > 0) {
        set({ departments: data });
        return data;
      }
      throw new Error('Empty or unavailable from CUPLEMS');
    } catch (err) {
      try {
        const fallback = await API.get('/departments');
        const list = fallback?.departments || fallback?.data?.departments || fallback?.data || [];
        const normalized = Array.isArray(list)
          ? list.map((d) => ({
              DeptID: d.DeptID || d._id,
              _id: d._id,
              DeptName: d.DeptName || d.name,
              Description: d.Description || d.description || '',
              IsActive: d.IsActive !== undefined ? d.IsActive : true,
            }))
          : [];
        set({ departments: normalized });
        return normalized;
      } catch (fErr) {
        set({ error: err.message });
      }
    }
  },

  createDepartment: async (dept) => {
    let result;
    try {
      const { data } = await CUPLEMS_API.post('/api/Departments', dept);
      result = data;
    } catch (err) {
      const fallback = await API.post('/departments', dept);
      const d = fallback?.department || fallback?.data?.department || fallback?.data || fallback;
      result = {
        DeptID: d.DeptID || d._id,
        _id: d._id,
        DeptName: d.DeptName || d.name || dept.DeptName,
        Description: d.Description || d.description || dept.Description || '',
        IsActive: true,
      };
    }
    set((state) => ({ departments: [...state.departments, result] }));
    return result;
  },

  updateDepartment: async (id, dept) => {
    try {
      await CUPLEMS_API.put(`/api/Departments/${id}`, { DeptID: id, ...dept });
    } catch (err) {
      await API.put(`/departments/${id}`, dept);
    }
    set((state) => ({
      departments: state.departments.map((d) =>
        (d.DeptID === id || d._id === id) ? { ...d, ...dept } : d
      ),
    }));
  },

  deleteDepartment: async (id) => {
    try {
      await CUPLEMS_API.delete(`/api/Departments/${id}`);
    } catch (err) {
      await API.delete(`/departments/${id}`);
    }
    set((state) => ({
      departments: state.departments.filter((d) => d.DeptID !== id && d._id !== id),
    }));
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
      set({ employeeTypes: Array.isArray(data) ? data : [] });
    } catch (err) {
      try {
        const fallback = await API.get('/employee-types');
        set({ employeeTypes: Array.isArray(fallback?.data) ? fallback.data : fallback || [] });
      } catch (fErr) {
        set({ error: err.message });
      }
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

  createPosition: async (pos) => {
    const { data } = await CUPLEMS_API.post('/api/Positions', pos);
    set((state) => ({ positions: [...state.positions, data] }));
    return data;
  },

  createEmployeeType: async (type) => {
    let result;
    try {
      const { data } = await CUPLEMS_API.post('/api/EmpTypes', type);
      result = data;
    } catch (err) {
      const fallback = await API.post('/employee-types', type);
      result = fallback.data || fallback;
    }
    set((state) => ({ employeeTypes: [...state.employeeTypes, result] }));
    return result;
  },

  createLocation: async (location) => {
    const { data } = await CUPLEMS_API.post('/api/Locations', location);
    set((state) => ({ locations: [...state.locations, data] }));
    return data;
  },

  updateLocation: async (id, location) => {
    await CUPLEMS_API.put(`/api/Locations/${id}`, { LocationID: id, ...location });
    set((state) => ({
      locations: state.locations.map((l) =>
        l.LocationID === id ? { ...l, ...location } : l
      ),
    }));
  },

  deleteLocation: async (id) => {
    await CUPLEMS_API.delete(`/api/Locations/${id}`);
    set((state) => ({
      locations: state.locations.filter((l) => l.LocationID !== id),
    }));
  },

  updateEmployeeType: async (id, type) => {
    try {
      await CUPLEMS_API.put(`/api/EmpTypes/${id}`, { EmpTypeID: id, ...type });
    } catch (err) {
      await API.put(`/employee-types/${id}`, type);
    }
    set((state) => ({
      employeeTypes: state.employeeTypes.map((t) =>
        t.EmpTypeID === id ? { ...t, ...type } : t
      ),
    }));
  },

  deleteEmployeeType: async (id) => {
    await CUPLEMS_API.delete(`/api/EmpTypes/${id}`);
    set((state) => ({
      employeeTypes: state.employeeTypes.filter((t) => t.EmpTypeID !== id),
    }));
  },
}));

export default useEmployeeStore;
