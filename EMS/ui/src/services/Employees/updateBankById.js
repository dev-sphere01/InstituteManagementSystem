// src/services/Employees/updateBankById.js
import API from '@/services/API';

/**
 * Updates bank details for a specific employee
 * @param {number|string} empId - The employee ID (EbdID for PUT endpoint)
 * @param {Object} bankDetail - Bank detail object (must include EbdID)
 * @returns {Promise<Object>} Promise that resolves to the API response
 * @throws {Error} Throws error if update fails
 */
const updateBankById = async (empId, bankDetail) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }

    if (!bankDetail || typeof bankDetail !== 'object') {
      throw new Error('Bank detail object is required');
    }

    if (!bankDetail.EbdID) {
      throw new Error('EbdID is required for updating bank details');
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
    formData.append('EbdID', bankDetail.EbdID);
    formData.append('EmpID', bankDetail.EmpID || empId);
    formData.append('BankName', bankDetail.BankName || '');
    formData.append('AccountNumber', bankDetail.AccountNumber || '');
    formData.append('IFSCCode', bankDetail.IFSCCode || '');
    formData.append('BranchName', bankDetail.BranchName || '');
    formData.append('UAN', bankDetail.UAN || '');
    
    // Append CancelledCheque file if it exists and is a File object
    if (bankDetail.CancelledCheque && bankDetail.CancelledCheque instanceof File) {
      formData.append('CancelledCheque', bankDetail.CancelledCheque);
    }

    console.log('Updating bank details with FormData for EbdID:', empId);
    console.log('Bank Details:', {
      EbdID: bankDetail.EbdID,
      EmpID: bankDetail.EmpID || empId,
      BankName: bankDetail.BankName,
      AccountNumber: bankDetail.AccountNumber,
      IFSCCode: bankDetail.IFSCCode,
      BranchName: bankDetail.BranchName,
      UAN: bankDetail.UAN,
      CancelledCheque: bankDetail.CancelledCheque instanceof File ? 'File attached' : 'No new file'
    });

    const response = await API.put(`/EmpBankDetails/${empId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // PUT request returns NoContent (204) on success, so response.data will be empty
    console.log('API Response status:', response.status);

    if (response.status === 204) {
      // Success - return the updated bank detail
      return bankDetail;
    }

    // If we get here, something unexpected happened
    console.log('Unexpected response:', response);
    return response.data || bankDetail;
  } catch (error) {
    console.error('Error updating bank details:', error);

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

export default updateBankById;