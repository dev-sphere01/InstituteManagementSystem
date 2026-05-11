// src/services/Employees/getEmpDeptPos.js
import API from '@/services/API';

/**
 * Fetches employee department and position details by employee ID
 * @param {number|string} empId - Employee ID
 * @returns {Promise<Object>} Employee department and position data
 * @throws {Error} Throws an error if the fetch fails
 */
const getEmpDeptPos = async (empId) => {
  try {
    const response = await API.get(`/EmpDeptPos/${empId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format: Expected data object');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching employee department and position:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

export default getEmpDeptPos;