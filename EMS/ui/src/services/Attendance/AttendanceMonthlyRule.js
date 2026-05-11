import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';

export const getAllMonthlyRules = async () => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.get('/AttendanceMonthlyRule');
    return data || [];
  }, [], (error) => {
    console.error('Failed to fetch monthly rules:', error);
  });
};

export const getMonthlyRuleById = async (id) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.get(`/AttendanceMonthlyRule/${id}`);
    return data;
  }, null);
};

export const createMonthlyRule = async (payload) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.post('/AttendanceMonthlyRule', payload);
    return data;
  }, null);
};

export const updateMonthlyRule = async (id, payload) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.put(`/AttendanceMonthlyRule/${id}`, payload);
    return data;
  }, null);
};

export const deleteMonthlyRule = async (id) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.delete(`/AttendanceMonthlyRule/${id}`);
    return data;
  }, null);
};

export default {
  getAllMonthlyRules,
  getMonthlyRuleById,
  createMonthlyRule,
  updateMonthlyRule,
  deleteMonthlyRule
};
