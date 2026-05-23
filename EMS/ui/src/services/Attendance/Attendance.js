import API from '@/services/API';
import { notification } from '@/services';
import ErrorHandler from '@/services/ErrorHandler';

const notify = notification();

/**
 * Upload attendance file (no front-end validation/processing)
 * Backend endpoint: POST /Attendances/ImportAttendance (expects IFormFile named "file")
 *
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<Object>} - The API response data
 */
export const uploadAttendanceExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/Attendances/ImportAttendance', formData);
  return response.data;
};

/**
 * Get attendance total hours by employees for a specific year and month
 * GET /Attendances/GetHoursbyEmployees?Year=YYYY&Month=M
 */
export const getHoursByEmployees = async (year, month) => {
  return await ErrorHandler.handle(async () => {
    if (!year || !month) return [];
    const { data } = await API.get(`/Attendances/GetHoursbyEmployees?Year=${year}&Month=${month}`);
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.Items) return data.Items;
    return [];
  }, [], (error) => {
    console.error(error.response?.data?.message || error.message || 'Failed to fetch attendance hours');
  });
};

/**
 * Update total hours for an employee's attendance
 * PUT /Attendances/UpdateAttendanceTotalHours
 * Body: { EmpID, Year, Month, NewTotalHours }
 */
export const updateAttendanceTotalHours = async (payload) => {
  return await ErrorHandler.handle(async () => {
    const { EmpID, Year, Month, NewTotalHours } = payload || {};
    if (!EmpID || !Year || !Month || NewTotalHours === undefined || NewTotalHours === null) {
      throw new Error('Missing required fields');
    }
    const { data } = await API.put('/Attendances/UpdateAttendanceTotalHours', payload);
    console.log('Attendance hours updated');
    return data;
  }, null, (error) => {
    console.error(error.response?.data?.message || error.message || 'Failed to update attendance hours');
  });
};

/**
 * Import total hours in bulk
 * POST /Attendances/ImportTotalHours
 * Body: [ { AthID, EmpID, Year, Month, TotalHours }, ... ]
 */
export const importTotalHours = async (list) => {
  return await ErrorHandler.handle(async () => {
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('No rows to import');
    }
    const { data } = await API.post('/Attendances/ImportTotalHours', list);
    console.log('Total hours imported successfully');
    return data;
  }, null, (error) => {
    console.error(error.response?.data?.message || error.message || 'Failed to import total hours');
  });
};

/**
 * Store total attendance hours for a specific year and month
 * POST /Attendances/StoreTotalAttendanceHours?Year=YYYY&Month=MM
 */
export const storeTotalAttendanceHours = async (year, month) => {
  return await ErrorHandler.handle(async () => {
    if (!year || !month) {
      throw new Error('Year and Month are required');
    }
    const { data } = await API.post(`/Attendances/StoreTotalAttendanceHours?Year=${year}&Month=${month}`);
    console.log('Total attendance hours stored successfully');
    return data;
  }, null, (error) => {
    console.error(error.response?.data?.message || error.message || 'Failed to store total attendance hours');
  });
};

export default {
  uploadAttendanceExcel,
  getHoursByEmployees,
  updateAttendanceTotalHours,
  importTotalHours,
  storeTotalAttendanceHours,
};