import API from '@/services/API';

// Search Loans & Advances with pagination, filters, and sorting
const getAllLoan = async (
  query = null,
  pageNumber = 1,
  pageSize = 5,
  _obStatus = null,
  _isActive = null,
  columnFilters = [],
  sorting = []
) => {
  try {
    const payload = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    // Global search
    if (query && query.trim() !== '') {
      payload.Query = query.trim();
    }

    // Column-specific filters mapping (limited for current table)
    if (Array.isArray(columnFilters)) {
      for (const { id, value } of columnFilters) {
        if (!value || String(value).trim() === '') continue;
        const trimmed = String(value).trim();
        switch (id) {
          case 'Employee':
            payload.EmployeeName = trimmed;
            break;
          case 'Description':
            payload.Description = trimmed;
            break;
          case 'Status':
            if (/^approved$/i.test(trimmed)) payload.IsApproved = true;
            else if (/^not approved$|^pending$/i.test(trimmed)) payload.IsApproved = false;
            break;
          case 'AmountMin':
            payload.LoanAmountMin = Number(trimmed);
            break;
          case 'AmountMax':
            payload.LoanAmountMax = Number(trimmed);
            break;
          default:
            // Fallback to global query refine
            payload.Query = trimmed;
            break;
        }
      }
    }

    // Sorting mapping to backend fields
    if (Array.isArray(sorting) && sorting.length > 0) {
      const s = sorting[0];
      const map = {
        Employee: 'EmployeeName',
        Amount: 'LoanAmount',
        Period: 'Period',
        MonthlyInstallment: 'MonthlyInstallment',
        StartDate: 'StartDate',
        Status: 'IsApproved',
        // 'Outstanding' cannot be sorted server-side (calculated after join)
      };
      const apiField = map[s.id];
      if (apiField) {
        payload.SortField = apiField;
        payload.SortOrder = s.desc ? 'desc' : 'asc';
      }
    }

    const response = await API.post('/LnAs/Search', payload);
    return response.data; // Expected PaginatedResponse<object>
  } catch (error) {
    console.error('LnA search error:', error);
    return null;
  }
};

const getLoan = { getAllLoan };
export default getLoan;