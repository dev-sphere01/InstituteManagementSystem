import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';

export const getAllDailyRules = async () => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.get('/AttendanceDailyRule');
    return data || [];
  }, [], (error) => {
    console.error('Failed to fetch daily rules:', error);
  });
};

export const getDailyRuleById = async (id) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.get(`/AttendanceDailyRule/${id}`);
    return data;
  }, null);
};

export const createDailyRule = async (payload) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.post('/AttendanceDailyRule', payload);
    return data;
  }, null);
};

export const updateDailyRule = async (id, payload) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.put(`/AttendanceDailyRule/${id}`, payload);
    return data;
  }, null);
};

export const deleteDailyRule = async (id) => {
  return await ErrorHandler.handle(async () => {
    const { data } = await API.delete(`/AttendanceDailyRule/${id}`);
    return data;
  }, null);
};

export default {
  getAllDailyRules,
  getDailyRuleById,
  createDailyRule,
  updateDailyRule,
  deleteDailyRule
};
