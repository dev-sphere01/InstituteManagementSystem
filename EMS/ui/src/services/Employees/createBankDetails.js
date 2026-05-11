// src/services/Employees/createBankDetails.js
import API from '@/services/API';

/**
 * Creates new bank details for a specific employee
 * @param {number|string} empId - The employee ID
 * @param {Object} bankDetail - Bank detail object
 * @returns {Promise<Object>} Promise that resolves to the created bank details
 * @throws {Error} Throws error if creation fails
 */
const createBankDetails = async (empId, bankDetail) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }

    if (!bankDetail || typeof bankDetail !== 'object') {
      throw new Error('Bank detail object is required');
    }

    // Validate the bank detail object
    if (!bankDetail.BankName?.trim()) {
      throw new Error('Bank name is required');
    }
    if (!bankDetail.AccountNumber?.trim()) {
      throw new Error('Account number is required');
    }
    if (!bankDetail.IFSCCode?.trim()) {
      throw new Error('IFSC code is required');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('EmpID', parseInt(empId));
    formData.append('BankName', bankDetail.BankName || '');
    formData.append('AccountNumber', bankDetail.AccountNumber || '');
    formData.append('IFSCCode', bankDetail.IFSCCode || '');
    formData.append('BranchName', bankDetail.BranchName || '');
    formData.append('UAN', bankDetail.UAN || '');
    
    // Append CancelledCheque file if it exists
    if (bankDetail.CancelledCheque && bankDetail.CancelledCheque instanceof File) {
      formData.append('CancelledCheque', bankDetail.CancelledCheque);
    }

    console.log('Creating bank details with FormData for EmpID:', empId);
    console.log('Bank Details:', {
      EmpID: parseInt(empId),
      BankName: bankDetail.BankName,
      AccountNumber: bankDetail.AccountNumber,
      IFSCCode: bankDetail.IFSCCode,
      BranchName: bankDetail.BranchName,
      UAN: bankDetail.UAN,
      CancelledCheque: bankDetail.CancelledCheque ? 'File attached' : 'No file'
    });

    const response = await API.post(`/EmpBankDetails`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('API Response:', response);

    // Return the created bank detail
    return response.data;
  } catch (error) {
    console.error('Error creating bank details:', error);

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

export default createBankDetails;