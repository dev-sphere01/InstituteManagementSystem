/**
 * Leave Report Service - Handles all leave report-related API calls
 */
import API from '@/services/API';

const LEAVE_REPORT_ENDPOINTS = {
  GENERATE_REPORT: '/Leaves/GenerateReport',
  GET_AVAILABLE_FIELDS: '/Leaves/AvailableReportFields',
  GENERATE_REGISTER_REPORT: '/Leaves/GenerateLeaveRegisterReport',
};

export const leaveReportService = {
  /**
   * Generate a dynamic leave report based on selected fields and filters
   * @param {Object} reportRequest - Report request object
   * @param {Array<string>} reportRequest.fields - Selected fields (e.g., ["Leave.LeaveType", "Employee.EmployeeName"])
   * @param {string} reportRequest.status - Leave status filter (Approved, Rejected, Pending)
   * @param {string} reportRequest.leaveType - Leave type filter
   * @param {number} reportRequest.empId - Employee ID filter (for specific employee)
   * @param {string} reportRequest.department - Department filter
   * @param {Date} reportRequest.startDate - Start date for filtering
   * @param {Date} reportRequest.endDate - End date for filtering
   * @param {string} reportRequest.format - Output format (JSON, Excel, CSV)
   * @returns {Promise} Report data or file download
   */
  async generateReport(reportRequest) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: reportRequest.format?.toLowerCase() !== 'json' ? 'blob' : 'json',
      };

      const response = await API.post(LEAVE_REPORT_ENDPOINTS.GENERATE_REPORT, reportRequest, config);
      return response.data;
    } catch (error) {
      console.error('Error generating leave report:', error);
      throw error;
    }
  },

  /**
   * Get list of available fields for leave report generation
   * @returns {Promise<Object>} Available fields grouped by category
   */
  async getAvailableFields() {
    try {
      const response = await API.get(LEAVE_REPORT_ENDPOINTS.GET_AVAILABLE_FIELDS);
      return normalizeFieldsData(response.data);
    } catch (error) {
      console.error('Error fetching available leave report fields:', error);
      return getDefaultAvailableFields();
    }
  },

  /**
   * Generate Leave Register Report
   * @param {string} viewType - Type of report view (manager or hr)
   * @returns {Promise} Report data
   */
  async generateLeaveRegisterReport(viewType) {
    try {
      const response = await API.post(
        LEAVE_REPORT_ENDPOINTS.GENERATE_REGISTER_REPORT,
        { viewType },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating leave register report:', error);
      throw error;
    }
  },

  /**
   * Download file from blob data
   * @param {Blob} blob - File blob
   * @param {string} fileName - File name
   */
  downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get field label from available fields
   * @param {string} fieldKey - Field key in format "Section.FieldName"
   * @param {Object} availableFields - Available fields object
   * @returns {string} User-friendly field label
   */
  getFieldLabel(fieldKey, availableFields) {
    if (!fieldKey) return fieldKey;

    const parts = fieldKey.split('.');
    if (parts.length === 2) {
      const [section, fieldName] = parts;
      const fields = availableFields[section] || [];
      const fieldDef = fields.find(f => f.key === fieldName);
      if (fieldDef) {
        return fieldDef.label;
      }
    }
    return fieldKey;
  },
};

/**
 * Normalize API field data to use lowercase 'key' and 'label' properties
 * Handles both uppercase (from API) and lowercase (from defaults) formats
 * @param {Object} fieldsData - Raw fields data from API
 * @returns {Object} Normalized fields data
 */
function normalizeFieldsData(fieldsData) {
  const normalized = {};

  for (const [section, fields] of Object.entries(fieldsData)) {
    if (Array.isArray(fields)) {
      normalized[section] = fields.map(field => {
        const normalizedField = {};
        
        if (field.Key) {
          normalizedField.key = field.Key;
        } else if (field.key) {
          normalizedField.key = field.key;
        }

        if (field.Label) {
          normalizedField.label = field.Label;
        } else if (field.label) {
          normalizedField.label = field.label;
        }

        return normalizedField;
      });
    }
  }

  return normalized;
}

/**
 * Get default available fields for leave reports if API call fails
 * @returns {Object} Default fields structure
 */
function getDefaultAvailableFields() {
  return {
    Employee: [
      { key: 'EmpID', label: 'Employee ID' },
      { key: 'EmployeeName', label: 'Employee Name' },
      { key: 'EmployeeCode', label: 'Employee Code' },
      { key: 'Department', label: 'Department' },
      { key: 'Designation', label: 'Designation' },
      { key: 'WorkEmail', label: 'Work Email' },
    ],
    Leave: [
      { key: 'LeaveID', label: 'Leave ID' },
      { key: 'LeaveType', label: 'Leave Type' },
      { key: 'LeaveReason', label: 'Leave Reason' },
      { key: 'StartDate', label: 'Start Date' },
      { key: 'EndDate', label: 'End Date' },
      { key: 'LeaveDays', label: 'Leave Days' },
      { key: 'CreatedAt', label: 'Applied Date' },
      { key: 'IsApproved', label: 'Status' },
      { key: 'ApproverName', label: 'Approver Name' },
      { key: 'RejectionReason', label: 'Rejection Reason' },
      { key: 'OnDutyHours', label: 'On Duty Hours' },
    ],
    LeaveBalance: [
      { key: 'Year', label: 'Year' },
      { key: 'OpeningBalance', label: 'Opening Balance' },
      { key: 'Availed', label: 'Availed' },
      { key: 'Adjusted', label: 'Adjusted' },
      { key: 'ClosingBalance', label: 'Closing Balance' },
    ],
    LeaveTransaction: [
      { key: 'LeaveTransactionID', label: 'Transaction ID' },
      { key: 'LeaveDate', label: 'Leave Date' },
      { key: 'TransactionType', label: 'Transaction Type' },
      { key: 'Days', label: 'Days' },
      { key: 'CreatedAt', label: 'Created Date' },
    ],
  };
}

export default leaveReportService;
