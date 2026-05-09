import API from '@/services/API';
import ErrorHandler from '@/services/ErrorHandler';



// Helper function to convert date to local ISO string (without timezone conversion)
const dateToLocalISOString = (date, hours = 0, minutes = 0, seconds = 0, ms = 0) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}:${s}`;
};

// Transform UI form data to API payload shape
const toApiPayload = (form, empId) => {
  // Parse date string (YYYY-MM-DD) in local timezone
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
  };

  const start = parseLocalDate(form.startDate);
  const end = parseLocalDate(form.endDate);

  // Support both `OnDutyHours` and `onDutyHours` from UI, and avoid forcing 0
  const rawHours = form?.OnDutyHours ?? form?.onDutyHours;
  const parsedHours =
    rawHours === '' || rawHours === null || rawHours === undefined
      ? null
      : parseInt(rawHours, 10);

  return {
    LeaveID: 0,
    EmpID: empId || 0,
    LeaveType: form.leaveType || '',
    LeaveReason: form.reason || '',
    IsApproved: true,
    StartDate: start ? dateToLocalISOString(start, 0, 0, 0) : null,
    EndDate: end ? dateToLocalISOString(end, 23, 59, 59) : null,
    CreatedAt: new Date().toISOString(),
    OnDutyHours: Number.isFinite(parsedHours) ? parsedHours : null,
  };
};

// Build query string from table state (for server-side pagination/filtering)
const buildQueryFromTableState = (tableState) => {
  if (!tableState) return '';
  const params = new URLSearchParams();
  const { pagination, sorting, globalFilter, columnFilters } = tableState;

  if (pagination) {
    params.set('Page', String((pagination.pageIndex ?? 0) + 1));
    params.set('PageSize', String(pagination.pageSize ?? 10));
  }

  if (globalFilter) params.set('Search', globalFilter);

  if (Array.isArray(sorting) && sorting.length > 0) {
    const s = sorting[0];
    params.set('SortBy', s.id);
    params.set('SortDir', s.desc ? 'desc' : 'asc');
  }

  if (Array.isArray(columnFilters)) {
    columnFilters.forEach((f) => {
      if (f?.id && f?.value) params.set(f.id, f.value);
    });
  }

  return params.toString();
};

const LeavesService = {
  // Get leaves for a specific employee by EmpID (server-side)
  async getLeaves(empId) {
    return await ErrorHandler.handle(async () => {
      if (empId === undefined || empId === null) return [];
      const { data } = await API.get(`Leaves/GetLeavesbyEmpID/${empId}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [] , (error) => {
      console.error(`Failed to fetch leaves: ${error.message}`);
    });
  },

  // Get pending approvals for current approver (token-based). No server pagination/filters.
  async getPendingApprovals(id) {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get(`Leaves/GetLeavestobeApproved/${id}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch pending approvals: ${error.message}`);
    });
  },

  // Get all leaves (admin overview)
  async getAllLeaves() {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get('/Leaves');
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch leaves: ${error.message}`);
    });
  },

  // Get leaves for employees under the current employee (for managers/admins)
  async getLeavesOfSubordinates(empId) {
    return await ErrorHandler.handle(async () => {
      if (empId === undefined || empId === null) return [];
      const { data } = await API.get(`Leaves/GetLeavesofEmployeesunderEmpID/${empId}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch subordinate leaves: ${error.message}`);
    });
  },

  // Create a new leave request
  async createLeave(formData, empOrUser, attachmentFile = null, approvedByEmpId = null) {
    return await ErrorHandler.handle(async () => {
      const empId = typeof empOrUser === 'number' ? empOrUser : (empOrUser?.empId || empOrUser?.EmpID || 0);
      const payload = toApiPayload(formData, empId);

      const formDataObj = new FormData();
      formDataObj.append('LeaveID', payload.LeaveID);
      formDataObj.append('EmpID', payload.EmpID);
      formDataObj.append('LeaveType', payload.LeaveType);
      formDataObj.append('LeaveReason', payload.LeaveReason);
      formDataObj.append('IsApproved', payload.IsApproved);
      formDataObj.append('StartDate', payload.StartDate);
      formDataObj.append('EndDate', payload.EndDate);
      formDataObj.append('CreatedAt', payload.CreatedAt);
      formDataObj.append('OnDutyHours', payload.OnDutyHours ?? '');
      formDataObj.append('ApprovedbyEmpID', approvedByEmpId || 0);
      
      if (attachmentFile) {
        formDataObj.append('file', attachmentFile);
        console.log('Leave application submitted with attachment');
      } else {
        console.log('Leave application submitted');
      }

      const { data } = await API.post('/Leaves', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    }, null, (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to submit leave';
      console.error(message);
    });
  },

  // Approve a leave
  async approveLeave(leaveId, approverEmpId, rejectionReason = '') {
    return await ErrorHandler.handle(async () => {
      if (!leaveId || !approverEmpId) throw new Error('Missing leave or approver ID');
      // API expects [FromBody] string; sending a string works with JSON as well
      await API.put(`Leaves/Approved/${leaveId}/${approverEmpId}`, rejectionReason ?? '');
      console.log('Leave approved');
      return true;
    }, false, (error) => {
      console.error(error.response?.data?.message || error.message || 'Failed to approve leave');
    });
  },

  // Reject a leave
  async rejectLeave(leaveId, approverEmpId, rejectionReason) {
    return await ErrorHandler.handle(async () => {
      if (!leaveId || !approverEmpId) throw new Error('Missing leave or approver ID');
      if (!rejectionReason || !String(rejectionReason).trim()) throw new Error('Rejection reason is required');
      await API.put(`Leaves/Reject/${leaveId}/${approverEmpId}`, rejectionReason);
      console.log('Leave rejected');
      return true;
    }, false, (error) => {
      console.error(error.response?.data?.message || error.message || 'Failed to reject leave');
    });
  },

  // Get leave reasons from API
  async getReasons() {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get('/Leaves/GetReasons');
      if (Array.isArray(data)) return data;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch reasons: ${error.message}`);
    });
  },

  // Get all employees with their department and position
  async getAllEmployeesWithDeptPos() {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get('/Leaves/GetAllEmployeesWithDeptPos');
      if (Array.isArray(data)) return data;
      return [];
    }, [], (error) => {
      console.error(`Failed to fetch employees with dept and position: ${error.message}`);
    });
  },
};

export default LeavesService;