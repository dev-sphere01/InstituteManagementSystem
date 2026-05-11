/**
 * Report Service - Handles all report-related API calls
 */
import API from '@/services/API';

const REPORT_ENDPOINTS = {
  GENERATE_REPORT: '/Reports/GetCustomReport',
  GET_AVAILABLE_FIELDS: '/Reports/AvailableFields',
};

export const reportService = {
  /**
   * Generate a dynamic report based on selected fields and filters
   * @param {Object} reportRequest - Report request object
   * @param {Array<string>} reportRequest.fields - Selected fields (e.g., ["Employee.EmployeeName", "Payroll.BasicSalary"])
   * @param {string} reportRequest.status - Employee status filter (Active, Inactive, etc.)
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

      const response = await API.post(REPORT_ENDPOINTS.GENERATE_REPORT, reportRequest, config);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Get list of available fields for report generation
   * @returns {Promise<Object>} Available fields grouped by entity
   */
  async getAvailableFields() {
    try {
      const response = await API.get(REPORT_ENDPOINTS.GET_AVAILABLE_FIELDS);
      // Normalize API response to use lowercase 'key' and 'label' properties
      return normalizeFieldsData(response.data);
    } catch (error) {
      console.error('Error fetching available fields:', error);
      // Return default fields if API call fails
      return getDefaultAvailableFields();
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
   * Converts field key to user-friendly label
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
  
  Object.entries(fieldsData).forEach(([category, fields]) => {
    normalized[category] = fields.map(field => ({
      key: field.key || field.Key,
      label: field.label || field.Label,
    }));
  });
  
  return normalized;
}

/**
 * Default available fields if backend endpoint is not available
 * This provides a fallback structure
 */
function getDefaultAvailableFields() {
  return {
    Employee: [
      { key: 'EmployeeName', label: 'Employee Name' },
      { key: 'EmployeeCode', label: 'Employee Code' },
      { key: 'Email', label: 'Email' },
      { key: 'MobileNo', label: 'Mobile Number' },
      { key: 'Department', label: 'Department' },
      { key: 'Designation', label: 'Designation' },
      { key: 'Status', label: 'Status' },
      { key: 'DateOfJoining', label: 'Date of Joining' },
      { key: 'DateOfBirth', label: 'Date of Birth' },
      { key: 'Gender', label: 'Gender' },
      { key: 'Address', label: 'Address' },
      { key: 'City', label: 'City' },
      { key: 'State', label: 'State' },
    ],
    Payroll: [
      { key: 'BasicSalary', label: 'Basic Salary' },
      { key: 'HRA', label: 'HRA' },
      { key: 'DA', label: 'DA' },
      { key: 'GrossSalary', label: 'Gross Salary' },
      { key: 'DeductionAmount', label: 'Deduction Amount' },
      { key: 'NetSalary', label: 'Net Salary' },
      { key: 'Month', label: 'Month' },
      { key: 'Year', label: 'Year' },
    ],
    Appraisal: [
      { key: 'AppraisalDate', label: 'Appraisal Date' },
      { key: 'Rating', label: 'Rating' },
      { key: 'Comments', label: 'Comments' },
      { key: 'ReviewedBy', label: 'Reviewed By' },
    ],
    Qualification: [
      { key: 'Qualification', label: 'Qualification' },
      { key: 'Institute', label: 'Institute' },
      { key: 'YearOfPassing', label: 'Year of Passing' },
      { key: 'Percentage', label: 'Percentage' },
    ],
    Increments: [
      { key: "PreviousCTC", label: "Previous CTC" },
      { key: "IncrementPercentage", label: "Increment Percentage (%)" },
      { key: "IncrementAmount", label: "Increment Amount" },
      { key: "NewCTC", label: "New CTC" },
      { key: "WEFDate", label: "WEF Date" },
      { key: "ApprovalStatus", label: "Approval Status" },
      { key: "IsProcessed", label: "Is Processed" },
      { key: "ArrearsAmount", label: "Arrears Amount" },
      { key: "ArrearsPaid", label: "Arrears Paid" },
      { key: "ProcessedDate", label: "Processed Date" },
      { key: "CreatedAt", label: "Created Date" }
    ],
  };
}

export default reportService;