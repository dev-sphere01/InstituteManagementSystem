import { create } from 'zustand';
import CUPLEMS_API from '../services/CUPLEMS_API';

const usePayrollStore = create((set, get) => ({
  // ── Shared state ──────────────────────────────────────────────────────────
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  selectedLocationId: null,
  loading: false,
  error: null,

  setMonth: (month) => set({ selectedMonth: month }),
  setYear: (year) => set({ selectedYear: year }),
  setLocationId: (locationId) => set({ selectedLocationId: locationId }),
  clearError: () => set({ error: null }),

  // ── Holidays ──────────────────────────────────────────────────────────────
  holidays: [],
  fetchHolidays: async (locationId) => {
    try {
      const { data } = await CUPLEMS_API.get('/api/PayrollHolidays', { params: { locationId } });
      set({ holidays: data });
    } catch (err) {
      set({ error: err.message });
    }
  },
  createHoliday: async (holiday) => {
    const { data } = await CUPLEMS_API.post('/api/PayrollHolidays', holiday);
    set((s) => ({ holidays: [...s.holidays, data] }));
    return data;
  },
  updateHoliday: async (id, holiday) => {
    const { data } = await CUPLEMS_API.put(`/api/PayrollHolidays/${id}`, holiday);
    set((s) => ({ holidays: s.holidays.map((h) => (h.Id === id ? data : h)) }));
    return data;
  },
  deleteHoliday: async (id) => {
    await CUPLEMS_API.delete(`/api/PayrollHolidays/${id}`);
    set((s) => ({ holidays: s.holidays.filter((h) => h.Id !== id) }));
  },

  // ── Shift Rules ───────────────────────────────────────────────────────────
  shiftRule: null,
  fetchShiftRule: async (locationId) => {
    try {
      const { data } = await CUPLEMS_API.get(`/api/ShiftRules/${locationId}`);
      set({ shiftRule: data });
      return data;
    } catch {
      set({ shiftRule: null });
      return null;
    }
  },
  saveShiftRule: async (locationId, rule) => {
    const { data } = await CUPLEMS_API.put(`/api/ShiftRules/${locationId}`, rule);
    set({ shiftRule: data });
    return data;
  },

  // ── Late Fine Rules ───────────────────────────────────────────────────────
  lateFineRule: null,
  fetchLateFineRule: async (locationId) => {
    try {
      const { data } = await CUPLEMS_API.get(`/api/LateFineRules/${locationId}`);
      set({ lateFineRule: data });
      return data;
    } catch {
      set({ lateFineRule: null });
      return null;
    }
  },
  saveLateFineRule: async (locationId, payload) => {
    const { data } = await CUPLEMS_API.put(`/api/LateFineRules/${locationId}`, payload);
    set({ lateFineRule: data });
    return data;
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendance: [],
  fetchAttendance: async (locationId, month, year) => {
    const { data } = await CUPLEMS_API.get('/api/Attendances', {
      params: { locationId, month, year },
    });
    set({ attendance: data });
    return data;
  },
  updateAttendance: async (id, payload) => {
    const { data } = await CUPLEMS_API.put(`/api/Attendances/${id}`, payload);
    set((s) => ({ attendance: s.attendance.map((a) => (a.AttendaceID === id ? data : a)) }));
    return data;
  },
  importAttendance: async (formData) => {
    const { data } = await CUPLEMS_API.post('/api/Attendances/Import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // ── Salary Assignments ────────────────────────────────────────────────────
  salaryHistory: [],
  fetchSalaryHistory: async (empId) => {
    const { data } = await CUPLEMS_API.get('/api/SalaryAssignments', { params: { empId } });
    set({ salaryHistory: Array.isArray(data) ? data : [data] });
    return data;
  },
  assignSalary: async (payload) => {
    const { data } = await CUPLEMS_API.post('/api/SalaryAssignments', payload);
    return data;
  },

  // ── Allowances ────────────────────────────────────────────────────────────
  allowances: [],
  fetchAllowances: async (empId, month, year) => {
    try {
      const { data } = await CUPLEMS_API.get('/api/MonthlyAllowances', {
        params: { empId, month, year },
      });
      set({ allowances: Array.isArray(data) ? data : [data] });
      // Return the single allowance object for the requested emp/month/year
      return Array.isArray(data) ? data[0] : data;
    } catch {
      return null;
    }
  },
  saveAllowance: async (payload) => {
    const { data } = await CUPLEMS_API.put('/api/MonthlyAllowances', payload);
    return data;
  },

  // ── Fines ─────────────────────────────────────────────────────────────────
  fines: [],
  fetchFines: async (empId, month, year) => {
    const { data } = await CUPLEMS_API.get('/api/EmployeeFines', {
      params: { empId, month, year },
    });
    set({ fines: data });
    return data;
  },
  addManualFine: async (fine) => {
    const { data } = await CUPLEMS_API.post('/api/EmployeeFines', fine);
    set((s) => ({ fines: [data, ...s.fines] }));
    return data;
  },
  deleteFine: async (id) => {
    await CUPLEMS_API.delete(`/api/EmployeeFines/${id}`);
    set((s) => ({ fines: s.fines.filter((f) => f.Id !== id) }));
  },

  // ── Holdings ──────────────────────────────────────────────────────────────
  holdings: [],
  fetchHoldings: async (empId, month, year) => {
    const params = {};
    if (empId) params.empId = empId;
    if (month) params.month = month;
    if (year) params.year = year;
    const { data } = await CUPLEMS_API.get('/api/SalaryHoldings', { params });
    set({ holdings: data });
    return data;
  },
  createHolding: async (holding) => {
    const { data } = await CUPLEMS_API.post('/api/SalaryHoldings', holding);
    set((s) => ({ holdings: [data, ...s.holdings] }));
    return data;
  },
  releaseHolding: async (id) => {
    const { data } = await CUPLEMS_API.patch(`/api/SalaryHoldings/${id}/release`);
    set((s) => ({ holdings: s.holdings.map((h) => (h.Id === id ? data : h)) }));
    return data;
  },
  cancelHolding: async (id) => {
    const { data } = await CUPLEMS_API.patch(`/api/SalaryHoldings/${id}/cancel`);
    set((s) => ({ holdings: s.holdings.map((h) => (h.Id === id ? data : h)) }));
    return data;
  },
  reduceHolding: async (id, newAmount) => {
    const { data } = await CUPLEMS_API.patch(`/api/SalaryHoldings/${id}/reduce`, { NewAmount: newAmount });
    set((s) => ({ holdings: s.holdings.map((h) => (h.Id === id ? data : h)) }));
    return data;
  },

  // ── Payroll Processing ────────────────────────────────────────────────────
  payrollRecords: [],
  fetchPayrollRecords: async (locationId, month, year) => {
    const { data } = await CUPLEMS_API.get('/api/SimplePayroll', {
      params: { locationId, month, year },
    });
    set({ payrollRecords: data });
    return data;
  },
  processPayroll: async (payload) => {
    // payload: { LocationId, Month, Year }
    const { data } = await CUPLEMS_API.post('/api/SimplePayroll/process', payload);
    return data;
  },
  approvePayroll: async (id) => {
    const { data } = await CUPLEMS_API.patch(`/api/SimplePayroll/${id}/approve`);
    set((s) => ({ payrollRecords: s.payrollRecords.map((p) => (p.Id === id ? data : p)) }));
    return data;
  },
  fetchSalarySlip: async (empId, month, year) => {
    const { data } = await CUPLEMS_API.get(`/api/SimplePayroll/slip/${empId}`, {
      params: { month, year },
    });
    return data;
  },

  // ── Incentives ────────────────────────────────────────────────────────────
  incentives: [],
  fetchIncentives: async (empId, month, year) => {
    const { data } = await CUPLEMS_API.get('/api/Incentives', {
      params: { empId, month, year },
    });
    set({ incentives: data });
    return data;
  },
  createIncentive: async (incentive) => {
    const { data } = await CUPLEMS_API.post('/api/Incentives', incentive);
    set((s) => ({ incentives: [data, ...s.incentives] }));
    return data;
  },
  updateIncentive: async (id, incentive) => {
    const { data } = await CUPLEMS_API.put(`/api/Incentives/${id}`, incentive);
    set((s) => ({ incentives: s.incentives.map((i) => (i.Id === id ? data : i)) }));
    return data;
  },
  deleteIncentive: async (id) => {
    await CUPLEMS_API.delete(`/api/Incentives/${id}`);
    set((s) => ({ incentives: s.incentives.filter((i) => i.Id !== id) }));
  },
}));

export default usePayrollStore;
