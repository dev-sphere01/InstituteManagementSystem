// src/services/Employees/updateEmpDeptPos.js
import API from '@/services/API';

/**
 * Updates employee department and position
 * @param {Object} data - Department and position data
 * @param {number} data.EdpID - EmpDeptPos ID (primary key)
 * @param {number} data.EmpID - Employee ID
 * @param {number} data.DeptID - Department ID
 * @param {number} data.PositionID - Position ID
 * @param {number} [data.EmpTypeID] - Employee Type ID (optional)
 * @returns {Promise<Object>} Updated employee department and position data
 * @throws {Error} Throws an error if the update fails
 */
const updateEmpDeptPos = async (data) => {
  try {
    if (!data.EdpID) {
      throw new Error('EdpID is required for updating employee department and position');
    }

    const payload = {
      EdpID: parseInt(data.EdpID),
      EmpID: parseInt(data.EmpID),
      DeptID: parseInt(data.DeptID),
      PositionID: parseInt(data.PositionID),
      ...(data.EmpTypeID && { EmpTypeID: parseInt(data.EmpTypeID) })
    };

    const response = await API.put(`/EmpDeptPos/${data.EdpID}`, payload);
    
    return response.data;
  } catch (error) {
    console.error('Error updating employee department and position:', error);

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

export default updateEmpDeptPos;