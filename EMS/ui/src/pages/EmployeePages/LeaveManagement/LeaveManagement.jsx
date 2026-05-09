import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SendHorizontal, CheckCircle, X } from 'lucide-react';

// components imports
import ApplyLeave from '@/pages/EmployeePages/LeaveManagement/components/ApplyLeave';
import LeaveHistory from '@/pages/EmployeePages/LeaveManagement/components/LeaveHistory';
import ApprovalsTableLite from '@/pages/EmployeePages/LeaveManagement/components/ApprovalsTableLite';

// services
import LeavesService from '@/services/Leaves/leavesService';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PayrollService from '@/services/Payroll/payrollService';
import useAuthStore from '@/store/authStore';
import { notification } from '@/services';

const LeaveManagement = () => {
  const { user } = useAuthStore();
  const notify = notification();

  // Apply form
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    OnDutyHours: 0,
    isApproved: true // For On-Duty leave type only
  });
  const [errors, setErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');

  // History for selected/current employee
  const [history, setHistory] = useState([]);

  // Admin selections (Department -> Employee)
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  
  // Direct reports
  const [directReports, setDirectReports] = useState([]);
  const [searchDirectReports, setSearchDirectReports] = useState('');
  const [userDeptId, setUserDeptId] = useState(null);
  const [loadingDirectReports, setLoadingDirectReports] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // All employees with dept and position (for DeptID 10 users)
  const [allEmployeesWithDeptPos, setAllEmployeesWithDeptPos] = useState([]);
  const [searchAllEmployees, setSearchAllEmployees] = useState('');
  const [isAllEmployeesDropdownOpen, setIsAllEmployeesDropdownOpen] = useState(false);
  const [filterDeptIdForSearch, setFilterDeptIdForSearch] = useState('');

  // All leaves (admin overview/approval)
  const [allLeaves, setAllLeaves] = useState([]);
  const [loadingAllLeaves, setLoadingAllLeaves] = useState(false);
  const [searchAll, setSearchAll] = useState('');

  const fetchHistory = async () => {
    const selected = selectedEmpId ? Number(selectedEmpId) : (user?.empId ?? user?.EmpID);
    if (!selected) { setHistory([]); return; }
    const data = await LeavesService.getLeaves(selected);
    setHistory(Array.isArray(data) ? data : []);
  };

  // Load departments for admins and fetch user's dept/direct reports
  useEffect(() => {
    const roleId = user?.roleId;
    const empId = user?.empId ?? user?.EmpID;
    
    if (roleId === 1) {
      (async () => {
        try {
          const list = await getAllDepartments();
          setDepartments(list || []);
          
          const empDeptPos = await PayrollService.getEmployeeDeptPos(empId);
          const deptId = empDeptPos?.DeptID;
          setUserDeptId(deptId);
          
          if (deptId === 10) {
            const allEmps = await LeavesService.getAllEmployeesWithDeptPos();
            setAllEmployeesWithDeptPos(Array.isArray(allEmps) ? allEmps : []);
          } else {
            setLoadingDirectReports(true);
            const reports = await PayrollService.getEmployeesReportingToManager(empId);
            setDirectReports(Array.isArray(reports) ? reports : []);
            setLoadingDirectReports(false);
          }
        } catch (e) {
          notify.error('Failed to load data', e);
          setLoadingDirectReports(false);
        }
      })();
    }
  }, [user?.roleId, user?.empId, user?.EmpID]);

  // Load employees when department changes
  useEffect(() => {
    const loadEmployees = async () => {
      if (!deptId) {
        setEmployees([]);
        setSelectedEmpId('');
        setHistory([]);
        return;
      }
      try {
        const list = await PayrollService.getEmployeesByDepartment(deptId);
        setEmployees(Array.isArray(list) ? list : []);
        setSelectedEmpId('');
        setHistory([]);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };
    loadEmployees();
  }, [deptId]);

  // Load history when user/selection changes
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.empId, user?.EmpID, selectedEmpId]);

  // Admin: load all leaves for overview/approvals
  const fetchAllLeaves = async () => {
    setLoadingAllLeaves(true);
    try {
      const data = await LeavesService.getAllLeaves?.();
      setAllLeaves(Array.isArray(data) ? data : []);
    } finally {
      setLoadingAllLeaves(false);
    }
  };

  useEffect(() => {
    if (user?.roleId === 1) {
      fetchAllLeaves();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.roleId]);

  const leaveTypes = ['Earned', 'On-Duty', 'Unpaid'];

  // Fetch reasons on component mount
  useEffect(() => {
    const fetchReasons = async () => {
      const data = await LeavesService.getReasons();
      setReasons(data || []);
    };
    fetchReasons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'endDate' && value && formData.startDate) {
      if (new Date(value) < new Date(formData.startDate)) {
        setErrors(prev => ({
          ...prev,
          endDate: 'End date must be after start date'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          endDate: ''
        }));
      }
    }

    if (name === 'startDate' && value && formData.endDate) {
      if (new Date(formData.endDate) < new Date(value)) {
        setErrors(prev => ({
          ...prev,
          endDate: 'End date must be after start date'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          endDate: ''
        }));
      }
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      reason: value
    }));
    if (value !== 'Other') {
      setCustomReason('');
    }
    if (errors.reason) {
      setErrors(prev => ({
        ...prev,
        reason: ''
      }));
    }
  };

  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
    if (errors.reason) {
      setErrors(prev => ({
        ...prev,
        reason: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.leaveType === 'On-Duty') {
      const hoursNum = Number(formData.OnDutyHours);
      if (!formData.OnDutyHours && formData.OnDutyHours !== 0) {
        newErrors.OnDutyHours = 'Hours is required for On-Duty';
      } else if (Number.isNaN(hoursNum)) {
        newErrors.OnDutyHours = 'Hours must be a number';
      } else if (!Number.isInteger(hoursNum)) {
        newErrors.OnDutyHours = 'Hours must be a whole number';
      }
      // else if (hoursNum < 1 || hoursNum > 15) {
      //   newErrors.OnDutyHours = 'Hours must be between 1 and 15';
      // }
    }

    if (formData.leaveType === 'On-Duty') {
      if (!customReason.trim()) {
        newErrors.reason = 'Reason is required';
      } else if (customReason.length < 10) {
        newErrors.reason = 'Reason must be at least 10 characters';
      }
    } else {
      if (!formData.reason) {
        newErrors.reason = 'Reason is required';
      } else if (formData.reason === 'Other') {
        if (!customReason.trim()) {
          newErrors.reason = 'Please enter a custom reason';
        } else if (customReason.length < 10) {
          newErrors.reason = 'Custom reason must be at least 10 characters';
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }

    // Admin must select an employee to apply on their behalf
    if (user?.roleId === 1 && !selectedEmpId) {
      setErrors(prev => ({ ...prev, leaveType: prev.leaveType || 'Select employee first' }));
      return;
    }

    try {
      setIsSubmitting(true);
      const targetEmpId = user?.roleId === 1 ? Number(selectedEmpId) : (user?.empId ?? user?.EmpID);
      const approvedByEmpId = user?.empId ?? user?.EmpID;
      const finalFormData = {
        ...formData,
        reason: formData.leaveType === 'On-Duty' ? customReason : (formData.reason === 'Other' ? customReason : formData.reason)
      };
      const created = await LeavesService.createLeave(finalFormData, targetEmpId, attachmentFile, approvedByEmpId);
      if (created) {
        setShowSuccessAlert(true);
        notify.success('Leave created successfully')
        setFormData({ leaveType: '', startDate: '', endDate: '', reason: '', OnDutyHours: '' });
        setCustomReason('');
        setAttachmentFile(null);
        await fetchHistory();
        if (user?.roleId === 1) await fetchAllLeaves();
        setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, attachment: 'File size must be less than 5MB' }));
        return;
      }
      setAttachmentFile(file);
      if (errors.attachment) {
        setErrors(prev => ({ ...prev, attachment: '' }));
      }
    }
  };

  const handleAttachmentRemove = () => {
    setAttachmentFile(null);
    if (errors.attachment) {
      setErrors(prev => ({ ...prev, attachment: '' }));
    }
  };

  const roleId = user?.roleId;

  // Filter direct reports by search
  const filteredDirectReports = useMemo(() => {
    if (!searchDirectReports.trim()) return directReports;
    const s = searchDirectReports.toLowerCase();
    return directReports.filter(emp =>
      String(emp.EmpID ?? '').toLowerCase().includes(s) ||
      String(emp.FirstName ?? '').toLowerCase().includes(s) ||
      String(emp.LastName ?? '').toLowerCase().includes(s)
    );
  }, [directReports, searchDirectReports]);

  // Filter all employees with dept/pos by search and department
  const filteredAllEmployees = useMemo(() => {
    let filtered = allEmployeesWithDeptPos;

    if (filterDeptIdForSearch) {
      filtered = filtered.filter(emp => Number(emp.DeptID) === Number(filterDeptIdForSearch));
    }

    if (!searchAllEmployees.trim()) return filtered;
    const s = searchAllEmployees.toLowerCase();
    return filtered.filter(emp =>
      String(emp.EmpID ?? '').toLowerCase().includes(s) ||
      String(emp.FirstName ?? '').toLowerCase().includes(s) ||
      String(emp.LastName ?? '').toLowerCase().includes(s) ||
      String(emp.DeptName ?? '').toLowerCase().includes(s) ||
      String(emp.PositionName ?? '').toLowerCase().includes(s)
    );
  }, [allEmployeesWithDeptPos, searchAllEmployees, filterDeptIdForSearch]);

  // Admin: filter all leaves by selected employee (optional)
  const filteredAllLeaves = useMemo(() => {
    let rows = allLeaves;
    if (selectedEmpId) rows = rows.filter(r => String(r.EmpID ?? '').toString() === String(selectedEmpId));
    if (searchAll) {
      const s = searchAll.toLowerCase();
      rows = rows.filter(r =>
        String(r.EmpID ?? '').toLowerCase().includes(s) ||
        String(r.EmployeeName ?? '').toLowerCase().includes(s) ||
        String(r.LeaveReason ?? '').toLowerCase().includes(s)
      );
    }
    return rows;
  }, [allLeaves, selectedEmpId, searchAll]);

  const fmtDate = (iso) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleDateString(); } catch { return '-'; }
  };

  return (
    <div className="h-full bg-gray-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-4"
      >
        {/* Success Alert */}
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium text-sm">
                Leave application submitted successfully!
              </span>
            </div>
            <button
              onClick={closeSuccessAlert}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Leave Register
          </h1>
          {/* <p className="text-gray-600 text-sm">
            Manage your leave applications and view remaining balances
          </p> */}
        </motion.div>

        {/* Admin: Department & Employee selection or Direct Reports */}
        {roleId === 1 && (
          <div className="bg-white shadow-lg p-4 rounded-lg mb-6 border border-gray-200">
            {userDeptId === 10 ? (
              <>
                <h2 className="text-md font-semibold text-gray-800 mb-3">Select Employee</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Filter by Department</span>
                    <select
                      value={filterDeptIdForSearch}
                      onChange={(e) => {
                        setFilterDeptIdForSearch(e.target.value);
                        if (selectedEmpId) setSelectedEmpId('');
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block md:col-span-3">
                    <span className="text-sm text-gray-700">Search Employee</span>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={selectedEmpId ? `${allEmployeesWithDeptPos.find(e => e.EmpID === Number(selectedEmpId))?.FirstName} ${allEmployeesWithDeptPos.find(e => e.EmpID === Number(selectedEmpId))?.LastName}` : searchAllEmployees}
                        onChange={(e) => {
                          if (selectedEmpId) {
                            setSelectedEmpId('');
                          }
                          setSearchAllEmployees(e.target.value);
                          setIsAllEmployeesDropdownOpen(true);
                        }}
                        onFocus={() => setIsAllEmployeesDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsAllEmployeesDropdownOpen(false), 150)}
                        placeholder="Search by ID, Name, Department, or Position"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      {isAllEmployeesDropdownOpen && (filteredAllEmployees.length > 0 || !searchAllEmployees) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
                          {filteredAllEmployees.length > 0 ? (
                            filteredAllEmployees.map((emp) => (
                              <button
                                key={emp.EmpID}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSelectedEmpId(emp.EmpID);
                                  setSearchAllEmployees('');
                                  setIsAllEmployeesDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 text-sm"
                              >
                                <div className="font-medium">{emp.FirstName} {emp.LastName}</div>
                                <div className="text-xs text-gray-500">ID: {emp.EmpID} | {emp.DeptName} | {emp.PositionName}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No employees found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-md font-semibold text-gray-800 mb-3">Select Employee</h2>
                <div className="grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Search Employee</span>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={searchDirectReports}
                        onChange={(e) => setSearchDirectReports(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                        placeholder="Search by ID, First Name, or Last Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      {isDropdownOpen && (filteredDirectReports.length > 0 || !searchDirectReports) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
                          {filteredDirectReports.length > 0 ? (
                            filteredDirectReports.map((emp) => (
                              <button
                                key={emp.EmpID}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSelectedEmpId(emp.EmpID);
                                  setSearchDirectReports('');
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 text-sm"
                              >
                                <div className="font-medium">{emp.FirstName} {emp.LastName}</div>
                                <div className="text-xs text-gray-500">ID: {emp.EmpID}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No employees found</div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedEmpId && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-sm">
                        <span className="text-gray-700">Selected: </span>
                        <span className="font-medium text-gray-900">
                          {directReports.find(e => e.EmpID === Number(selectedEmpId))?.FirstName}{' '}
                          {directReports.find(e => e.EmpID === Number(selectedEmpId))?.LastName}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left Side - Leave Balances */}
          {/* <LeaveBalance ... /> */}

          {/* Right Side - Apply for Leave Form */}
          {roleId === 1 ? (
            selectedEmpId ? (
              <ApplyLeave 
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                handleSubmit={handleSubmit}
                motion={motion}
                leaveTypes={leaveTypes}
                SendHorizontal={SendHorizontal}
                isSubmitting={isSubmitting}
                attachmentFile={attachmentFile}
                onAttachmentChange={handleAttachmentChange}
                onAttachmentRemove={handleAttachmentRemove}
                reasons={reasons}
                onReasonChange={handleReasonChange}
                customReason={customReason}
                onCustomReasonChange={handleCustomReasonChange}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 text-sm text-gray-700">
                Select a department and employee to apply leave on their behalf.
              </div>
            )
          ) : (
            <ApplyLeave 
              formData={formData}
              handleInputChange={handleInputChange}
              errors={errors}
              handleSubmit={handleSubmit}
              motion={motion}
              leaveTypes={leaveTypes}
              SendHorizontal={SendHorizontal}
              isSubmitting={isSubmitting}
              attachmentFile={attachmentFile}
              onAttachmentChange={handleAttachmentChange}
              onAttachmentRemove={handleAttachmentRemove}
              reasons={reasons}
              onReasonChange={handleReasonChange}
              customReason={customReason}
              onCustomReasonChange={handleCustomReasonChange}
            />
          )}
        </div>

        {/* Approvals Table for managers (pending approvals assigned to you) */}
        {/* {roleId === 1 && (
          <div className="mt-6">
            <ApprovalsTableLite />
          </div>
        )} */}

        {/* History - for selected/current employee */}
        <div className="mt-6">
          <LeaveHistory items={history} />
        </div>

        {/* Admin: All Leaves (using GET /leaves) with inline approve/reject */}
        {roleId === 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-800">All Leaves</h2>
              <input
                type="text"
                value={searchAll}
                onChange={(e) => setSearchAll(e.target.value)}
                placeholder="Search by ID/Name/Reason"
                className="px-3 py-2 rounded border border-slate-300 text-gray-800 bg-white w-64 text-sm"
              />
            </div>
            <div className="overflow-auto rounded border border-slate-200">
              <table className="min-w-full table-fixed text-gray-800">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="px-3 py-2 border-b w-[18%]">Employee</th>
                    <th className="px-3 py-2 border-b w-[10%]">Type</th>
                    <th className="px-3 py-2 border-b w-[36%]">Reason</th>
                    <th className="px-3 py-2 border-b w-[10%]">Start</th>
                    <th className="px-3 py-2 border-b w-[10%]">End</th>
                    <th className="px-3 py-2 border-b w-[8%]">Status</th>
                    <th className="px-3 py-2 border-b w-[16%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAllLeaves ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-500">Loading...</td></tr>
                  ) : filteredAllLeaves.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-gray-700">No records</td></tr>
                  ) : filteredAllLeaves.map((row, idx) => (
                    <tr key={`${row.LeaveID ?? idx}`} className="hover:bg-slate-50">
                      <td className="px-3 py-2 border-b text-sm">{row.EmployeeName ?? row.EmpID ?? '-'}</td>
                      <td className="px-3 py-2 border-b text-sm">{row.LeaveType ?? '-'}</td>
                      <td className="px-3 py-2 border-b text-sm align-top">
                        <div className="truncate" title={row.LeaveReason || ''}>{row.LeaveReason ?? '-'}</div>
                      </td>
                      <td className="px-3 py-2 border-b text-sm">{fmtDate(row.StartDate)}</td>
                      <td className="px-3 py-2 border-b text-sm">{fmtDate(row.EndDate)}</td>
                      <td className="px-3 py-2 border-b text-sm">
                        {row.IsApproved === true ? 'Approved' : row.IsApproved === false ? 'Rejected' : 'Pending'}
                      </td>
                      <td className="px-3 py-2 border-b text-sm">
                        {row.IsApproved === null ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                              onClick={async () => {
                                const ok = window.confirm('Approve this leave?');
                                if (!ok) return;
                                await LeavesService.approveLeave(row.LeaveID, user.empId ?? user.EmpID);
                                await fetchAllLeaves();
                                await fetchHistory();
                              }}
                            >Approve</button>
                            <button
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                              onClick={async () => {
                                const reason = window.prompt('Enter rejection reason');
                                if (reason && reason.trim()) {
                                  await LeavesService.rejectLeave(row.LeaveID, user.empId ?? user.EmpID, reason.trim());
                                  await fetchAllLeaves();
                                  await fetchHistory();
                                }
                              }}
                            >Reject</button>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveManagement;