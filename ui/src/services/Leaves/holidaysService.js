import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';

const HolidaysService = {
  /**
   * Get all holidays for a specific year
   * @param {number} year - The year to fetch holidays for
   * @returns {Promise<Array>} Array of holidays
   */
  async getHolidaysByYear(year) {
    return await ErrorHandler.handle(async () => {
      if (!year || year < 2000) return [];
      const { data } = await API.get(`Holidays/GetAllHolidaybyYear/${year}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch holidays for year ${year}: ${error.message}`);
    });
  },

  /**
   * Get all holidays
   * @returns {Promise<Array>} Array of all holidays
   */
  async getAllHolidays() {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get('Holidays');
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch holidays: ${error.message}`);
    });
  },

  /**
   * Import holidays from Excel file
   * @param {File} file - Excel file to import
   * @param {number} year - Year for the holidays
   * @returns {Promise<Object>} Import result with message and count
   */
  async importHolidays(file, year) {
    return await ErrorHandler.handle(async () => {
      const formData = new FormData();
      formData.append('formFile', file);
      formData.append('Year', year);

      const { data } = await API.post('Holidays/ImportHolidays', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    }, null, (error) => {
      console.error(`Failed to import holidays: ${error.message}`);
    });
  },

  /**
   * Create a new holiday
   * @param {string} holidayName - Name of the holiday
   * @param {Date} date - Date of the holiday
   * @param {number} year - Year of the holiday
   * @returns {Promise<Object>} Created holiday data
   */
  async createHoliday(holidayName, date, year) {
    return await ErrorHandler.handle(async () => {
      const payload = {
        HolidayName: holidayName,
        Date: date instanceof Date ? date.toISOString() : date,
        Year: year
      };

      const { data } = await API.post('Holidays', payload);
      return data;
    }, null, (error) => {
      console.error(`Failed to create holiday: ${error.message}`);
    });
  },

  /**
   * Delete a holiday by ID
   * @param {number} id - Holiday ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteHoliday(id) {
    return await ErrorHandler.handle(async () => {
      await API.delete(`Holidays/${id}`);
      return true;
    }, false, (error) => {
      console.error(`Failed to delete holiday: ${error.message}`);
    });
  },
};

export default HolidaysService;