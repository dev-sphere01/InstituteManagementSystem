import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Building, GraduationCap, CreditCard, Settings, Eye, FileText, Edit3, Save, X, CheckCircle, Info, ClipboardList, Wallet, CalendarDays, TrendingUp, Users } from 'lucide-react';
import EmployeeService from '@/services/Employees/employees';
import getBankById from '@/services/Employees/getBankById';
import getAcadById from '@/services/Employees/getAcadById';
import getDocsById from '@/services/Employees/getDocsById';
import { getProfById, updateProfById } from '@/services/Employees/empProfileDetails';
import updateAcadById from '@/services/Employees/updateAcadById';
import updateBankById from '@/services/Employees/updateBankById';
import createBankDetails from '@/services/Employees/createBankDetails';
import getEmpDeptPos from '@/services/Employees/getEmpDeptPos';
import updateEmpDeptPos from '@/services/Employees/updateEmpDeptPos';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PositionService from '@/services/Positions/positions';
// import getPositionsByDepartment from '@/services/Positions/positions';
import getBaseFileURL from '@/utils/getBaseFileURL';
import PreviewModal from './PreviewModal';
import { notification, API } from '@/services';
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

// Bank list for dropdown
const banks = [
  { id: 1, name: 'Union Bank of India' },
  { id: 2, name: 'Indian Bank' },
];

// Helper components defined outside to prevent re-creation on each render
const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="text-blue-600" size={20} />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value, isEditable = false, field, onChange, type = 'text', isEditMode }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
    {isEditMode && isEditable ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => {
          const newValue = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
          onChange(field, newValue);
        }}
        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
    ) : (
      <span className="text-gray-600">{value || 'Not provided'}</span>
    )}
  </div>
);

const InfoRowWithPreview = ({ label, value, documentPath, documentName, onPreview }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
    <div className="flex items-center gap-2">
      <span className="text-gray-600">{value || 'Not provided'}</span>
      {documentPath && (
        <button
          onClick={() => onPreview(documentPath, documentName)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <Eye size={12} />
          Preview
        </button>
      )}
    </div>
  </div>
);

const InfoRowDropdown = ({ label, value, options, field, onChange, isEditMode, valueKey = 'id', labelKey = 'name' }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
    {isEditMode ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(field, parseInt(e.target.value))}
        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    ) : (
      <span className="text-gray-600">
        {options.find(opt => opt[valueKey] === value)?.[labelKey] || 'Not assigned'}
      </span>
    )}
  </div>
);

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState(null);
  const [professionalDetails, setProfessionalDetails] = useState(null);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [professionalError, setProfessionalError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [originalEmployee, setOriginalEmployee] = useState(null);
  const [editedBankDetails, setEditedBankDetails] = useState(null);
  const [originalBankDetails, setOriginalBankDetails] = useState(null);
  const [editedAcademicDetails, setEditedAcademicDetails] = useState(null);
  const [originalAcademicDetails, setOriginalAcademicDetails] = useState(null);
  const [editedProfessionalDetails, setEditedProfessionalDetails] = useState(null);
  const [originalProfessionalDetails, setOriginalProfessionalDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bankValidationErrors, setBankValidationErrors] = useState({});
  const [empDeptPos, setEmpDeptPos] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [empDeptPosLoading, setEmpDeptPosLoading] = useState(false);
  const [empDeptPosError, setEmpDeptPosError] = useState(null);
  const [editedEmpDeptPos, setEditedEmpDeptPos] = useState(null);
  const [originalEmpDeptPos, setOriginalEmpDeptPos] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [incrementHistory, setIncrementHistory] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [incrementLoading, setIncrementLoading] = useState(false);
  const [reportingManagers, setReportingManagers] = useState([]);
  const [reportingManagersLoading, setReportingManagersLoading] = useState(false);
  const [reportingManagersError, setReportingManagersError] = useState(null);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableManagersLoading, setAvailableManagersLoading] = useState(false);
  const [availableManagersError, setAvailableManagersError] = useState(null);
  const [editedReportingManagerIds, setEditedReportingManagerIds] = useState([]);
  const [originalReportingManagerIds, setOriginalReportingManagerIds] = useState([]);
  const [reportingManagersDropdownOpen, setReportingManagersDropdownOpen] = useState(false);
  const [reportingManagersSearchTerm, setReportingManagersSearchTerm] = useState('');
  const [currentSalary, setCurrentSalary] = useState(null);
  const [currentSalaryLoading, setCurrentSalaryLoading] = useState(false);
  const [currentSalaryError, setCurrentSalaryError] = useState(null);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [rehireModalOpen, setRehireModalOpen] = useState(false);
  const [terminateData, setTerminateData] = useState({
    DateofLeaving: '',
    TerminateReasonOrLeavingReason: ''
  });
  const [rehireDate, setRehireDate] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);
  const [isRehiring, setIsRehiring] = useState(false);
  const notify = notification();

  //permissions
  const canEdit = hasPermission('employee_management.all_employees.update')


  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await EmployeeService.getEmployeeById(id);
      console.log('Employee details:', response);
      setEmployee(response);

      // Fetch bank, academic, and document details after getting employee details
      if (response && response.EmpID) {
        fetchBankDetails(response.EmpID);
        fetchAcademicDetails(response.EmpID);
        fetchDocumentDetails(response.EmpID);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError(error.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async (empId) => {
    try {
      setBankLoading(true);
      setBankError(null);
      const bankData = await getBankById(empId);
      console.log('Bank details:', bankData);
      setBankDetails(bankData);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      // If no bank details found (404), set bankDetails to null but don't set error
      // This allows the form to be shown for creating new bank details
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        setBankDetails(null);
        setBankError(null);
      } else {
        setBankError(error.message || 'Failed to fetch bank details');
        setBankDetails(null);
      }
    } finally {
      setBankLoading(false);
    }
  };

  const fetchAcademicDetails = async (empId) => {
    try {
      setAcademicLoading(true);
      setAcademicError(null);
      const academicData = await getAcadById(empId);
      console.log('Academic details:', academicData);
      setAcademicDetails(academicData);
    } catch (error) {
      console.error('Error fetching academic details:', error);
      setAcademicError(error.message || 'Failed to fetch academic details');
      setAcademicDetails(null);
    } finally {
      setAcademicLoading(false);
    }
  };

  const fetchDocumentDetails = async (empId) => {
    try {
      setDocumentLoading(true);
      setDocumentError(null);
      const documentData = await getDocsById(empId);
      console.log('Document details:', documentData);
      setDocumentDetails(documentData);
    } catch (error) {
      console.error('Error fetching document details:', error);
      setDocumentError(error.message || 'Failed to fetch document details');
      setDocumentDetails(null);
    } finally {
      setDocumentLoading(false);
    }
  };

  const fetchProfessionalDetails = async (empId) => {
    try {
      setProfessionalLoading(true);
      setProfessionalError(null);
      const professionalData = await getProfById(empId);
      console.log('Professional details:', professionalData);
      setProfessionalDetails(professionalData);
    } catch (error) {
      console.error('Error fetching professional details:', error);
      setProfessionalError(error.message || 'Failed to fetch professional details');
      setProfessionalDetails(null);
    } finally {
      setProfessionalLoading(false);
    }
  };

  const fetchEmpDeptPos = async (empId) => {
    try {
      setEmpDeptPosLoading(true);
      setEmpDeptPosError(null);
      const empDeptPosData = await getEmpDeptPos(empId);
      console.log('Employee Department & Position details:', empDeptPosData);
      setEmpDeptPos(empDeptPosData);
    } catch (error) {
      console.error('Error fetching employee department and position:', error);
      setEmpDeptPosError(error.message || 'Failed to fetch department and position details');
      setEmpDeptPos(null);
    } finally {
      setEmpDeptPosLoading(false);
    }
  };

  const fetchPerformanceReviews = async (empId) => {
    try {
      setPerformanceLoading(true);
      const response = await API.get(`/EmpAssessments/GetReviewofEmpID/${empId}`);
      setPerformanceReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const fetchLoanHistory = async (empId) => {
    try {
      setLoanLoading(true);
      const response = await API.get(`/LnAs/ByEmployee?empId=${empId}`);
      setLoanHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching loan history:', error);
    } finally {
      setLoanLoading(false);
    }
  };

  const fetchLeaveHistory = async (empId) => {
    try {
      setLeaveLoading(true);
      const response = await API.get(`/Leaves/${empId}`);
      setLeaveHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setLeaveLoading(false);
    }
  };

  const fetchIncrementHistory = async (empId) => {
    try {
      setIncrementLoading(true);
      const response = await API.get(`/EmpIncrements/Employee/${empId}`);
      setIncrementHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching increment history:', error);
    } finally {
      setIncrementLoading(false);
    }
  };

  const fetchReportingManagers = async (empId) => {
    try {
      setReportingManagersLoading(true);
      setReportingManagersError(null);
      const response = await API.get(`/Employees/GetReportingManagers/${empId}`);
      const managers = Array.isArray(response.data) ? response.data : [];
      console.log('Reporting managers fetched:', managers);
      setReportingManagers(managers);
      // Extract manager IDs for editing
      const managerIds = managers.map(m => m.EmpID);
      setEditedReportingManagerIds(managerIds);
      setOriginalReportingManagerIds(managerIds);
    } catch (error) {
      console.error('Error fetching reporting managers:', error);
      setReportingManagersError(error.message || 'Failed to fetch reporting managers');
      setReportingManagers([]);
    } finally {
      setReportingManagersLoading(false);
    }
  };

  const fetchAvailableManagers = async (empId) => {
    try {
      setAvailableManagersLoading(true);
      setAvailableManagersError(null);
      const response = await API.get(`/Employees/ManagerSelection/${empId}`);
      const managers = Array.isArray(response.data) ? response.data : [];
      console.log('Available managers fetched:', managers);
      setAvailableManagers(managers);
    } catch (error) {
      console.error('Error fetching available managers:', error);
      // Don't set error state if we got a 404, just log it
      if (error.response?.status !== 404) {
        setAvailableManagersError(error.message || 'Failed to fetch available managers');
      }
      setAvailableManagers([]);
    } finally {
      setAvailableManagersLoading(false);
    }
  };

  const fetchCurrentSalary = async (empId) => {
    try {
      setCurrentSalaryLoading(true);
      setCurrentSalaryError(null);
      const response = await API.get(`/EmpCTCandPayrolls/ByEmployee/${empId}`);
      console.log('Current salary fetched:', response.data);
      setCurrentSalary(response.data);
    } catch (error) {
      console.error('Error fetching current salary:', error);
      setCurrentSalaryError(error.message || 'Failed to fetch current salary');
      setCurrentSalary(null);
    } finally {
      setCurrentSalaryLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsData = await getAllDepartments();
      console.log('Departments:', departmentsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      notify.error('Failed to fetch departments: ' + error.message);
    }
  };

  const fetchPositions = async () => {
    try {
      const positionsData = await PositionService.getAllPositions();
      console.log('Positions:', positionsData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error fetching positions:', error);
      notify.error('Failed to fetch positions: ' + error.message);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    fetchBankDetails(id);
    fetchAcademicDetails(id);
    fetchDocumentDetails(id);
    fetchProfessionalDetails(id);
    fetchEmpDeptPos(id);
    fetchPerformanceReviews(id);
    fetchLoanHistory(id);
    fetchLeaveHistory(id);
    fetchIncrementHistory(id);
    fetchReportingManagers(id);
    fetchAvailableManagers(id);
    fetchDepartments();
    fetchCurrentSalary(id);
    // fetchPositions();
    // Don't fetch all positions on load - they will be fetched based on department selection
  }, [id]);

  // Fetch positions when empDeptPos is loaded and has a department
  useEffect(() => {
    const loadPositionsForDepartment = async () => {
      if (empDeptPos && empDeptPos.DeptID) {
        try {
          const filteredPositions = await PositionService.getPositionsByDepartment(empDeptPos.DeptID);
          console.log('Positions for employee department:', filteredPositions);
          setPositions(filteredPositions);
        } catch (error) {
          console.error('Error fetching positions for employee department:', error);
        }
      }
    };

    loadPositionsForDepartment();
  }, [empDeptPos]);

  const handlePreviewDocument = (documentPath, documentName) => {
    const baseUrl = getBaseFileURL();
    const fullUrl = `${baseUrl}${documentPath}`;
    console.log('Preview URL:', fullUrl); // Debug log
    setPreviewModal({
      isOpen: true,
      documentUrl: fullUrl,
      documentName: documentName
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      documentUrl: '',
      documentName: ''
    });
  };

  const handleEditMode = async () => {
    setIsEditMode(true);
    // Initialize editedEmployee with AtdEmpCode as 0 if it's null
    const empData = {
      ...employee,
      AtdEmpCode: employee.AtdEmpCode ?? 0
    };
    setEditedEmployee(empData);
    setOriginalEmployee(empData);

    // Initialize bank details with empty object if they don't exist
    const bankData = bankDetails ? { ...bankDetails } : {
      BankName: '',
      AccountNumber: '',
      IFSCCode: '',
      BranchName: '',
      CancelledCheque: null,
      UAN: ''
    };
    setEditedBankDetails(bankData);
    setOriginalBankDetails(bankData);

    const acadData = academicDetails ? [...academicDetails] : null;
    setEditedAcademicDetails(acadData);
    setOriginalAcademicDetails(acadData);

    const profData = professionalDetails ? [...professionalDetails] : null;
    setEditedProfessionalDetails(profData);
    setOriginalProfessionalDetails(profData);

    const empDeptPosData = empDeptPos ? { ...empDeptPos } : {
      EdpID: null,
      EmpID: parseInt(id),
      DeptID: null,
      PositionID: null
    };
    setEditedEmpDeptPos(empDeptPosData);
    setOriginalEmpDeptPos(empDeptPosData);

    // Initialize reporting managers - use the ReportsTo array from employee data if available
    const managerIds = employee.ReportsTo && Array.isArray(employee.ReportsTo)
      ? employee.ReportsTo
      : reportingManagers.map(m => m.EmpID);
    console.log('Initializing reporting managers:', managerIds);
    console.log('Available managers:', availableManagers);
    setEditedReportingManagerIds(managerIds);
    setOriginalReportingManagerIds(managerIds);

    // If employee has a department assigned, fetch positions for that department
    if (empDeptPos && empDeptPos.DeptID) {
      try {
        const filteredPositions = await getPositionsByDepartment(empDeptPos.DeptID);
        console.log('Positions for current department:', filteredPositions);
        setPositions(filteredPositions);
      } catch (error) {
        console.error('Error fetching positions for current department:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedEmployee(null);
    setOriginalEmployee(null);
    setEditedBankDetails(null);
    setOriginalBankDetails(null);
    setEditedAcademicDetails(null);
    setOriginalAcademicDetails(null);
    setEditedProfessionalDetails(null);
    setOriginalProfessionalDetails(null);
    setEditedEmpDeptPos(null);
    setOriginalEmpDeptPos(null);
    setEditedReportingManagerIds([]);
    setOriginalReportingManagerIds([]);
    setReportingManagersDropdownOpen(false);
    setReportingManagersSearchTerm('');
    setBankValidationErrors({});
  };

  const validateBankDetails = () => {
    if (!editedBankDetails) return true;

    const errors = {};
    if (!editedBankDetails.BankName?.trim()) {
      errors.BankName = "Enter your bank's name";
    }
    if (!editedBankDetails.AccountNumber || isNaN(editedBankDetails.AccountNumber) || editedBankDetails.AccountNumber.length < 8) {
      errors.AccountNumber = "Enter a valid account number (minimum 8 digits)";
    }
    if (!editedBankDetails.IFSCCode?.trim() || editedBankDetails.IFSCCode.trim().length !== 11) {
      errors.IFSCCode = "Enter a valid 11-character IFSC code";
    }
    // if (!editedBankDetails.BranchName?.trim()) {
    //   errors.BranchName = "Enter branch name";
    // }

    setBankValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      let hasChanges = false;

      // Check if employee basic info has changed
      const employeeChanged = editedEmployee && JSON.stringify(editedEmployee) !== JSON.stringify(originalEmployee);
      if (employeeChanged) {
        console.log('Saving employee data:', editedEmployee);
        console.log('AtdEmpCode value:', editedEmployee.AtdEmpCode, 'Type:', typeof editedEmployee.AtdEmpCode);

        // Add ReportsTo array to the employee data
        const employeeDataToSave = {
          ...editedEmployee,
          ReportsTo: editedReportingManagerIds
        };

        await EmployeeService.updateEmployee(id, employeeDataToSave);
        setEmployee(employeeDataToSave);
        hasChanges = true;
      }

      // Check if reporting managers have changed (update via employee endpoint if not already updated)
      const reportingManagersChanged = JSON.stringify(editedReportingManagerIds) !== JSON.stringify(originalReportingManagerIds);
      if (reportingManagersChanged && !employeeChanged) {
        console.log('Updating reporting managers:', editedReportingManagerIds);
        try {
          const employeeDataToSave = {
            ...employee,
            ReportsTo: editedReportingManagerIds
          };
          await EmployeeService.updateEmployee(id, employeeDataToSave);
          setEmployee(employeeDataToSave);
          hasChanges = true;
        } catch (error) {
          console.error('Error updating reporting managers:', error);
          notify.error('Failed to update reporting managers: ' + error.message);
        }
      }

      // Check if bank details have changed
      const bankChanged = editedBankDetails && JSON.stringify(editedBankDetails) !== JSON.stringify(originalBankDetails);
      if (bankChanged) {
        const hasBankData = editedBankDetails.BankName || editedBankDetails.AccountNumber ||
          editedBankDetails.IFSCCode || editedBankDetails.BranchName ||
          editedBankDetails.UAN;

        if (hasBankData) {
          if (bankDetails && bankDetails.EbdID) {
            // Update existing bank details (PUT)
            console.log('Updating existing bank details with EbdID:', bankDetails.EbdID);
            await updateBankById(bankDetails.EbdID, editedBankDetails);
            setBankDetails(editedBankDetails);
          } else {
            // Create new bank details (POST)
            console.log('Creating new bank details for employee:', id);
            const createdBankDetails = await createBankDetails(id, editedBankDetails);
            setBankDetails(createdBankDetails);
          }
          hasChanges = true;
        }
      }

      // Check if academic details have changed
      const academicChanged = editedAcademicDetails && JSON.stringify(editedAcademicDetails) !== JSON.stringify(originalAcademicDetails);
      if (academicChanged && academicDetails) {
        for (const academic of editedAcademicDetails) {
          if (academic.EadID) {
            await updateAcadById(id, academic);
          }
        }
        setAcademicDetails(editedAcademicDetails);
        hasChanges = true;
      }

      // Check if professional details have changed
      const professionalChanged = editedProfessionalDetails && JSON.stringify(editedProfessionalDetails) !== JSON.stringify(originalProfessionalDetails);
      if (professionalChanged && professionalDetails) {
        for (const prof of editedProfessionalDetails) {
          if (prof.EpdID) {
            await updateProfById(id, prof);
          }
        }
        setProfessionalDetails(editedProfessionalDetails);
        hasChanges = true;
      }

      // Check if department and position have changed
      const empDeptPosChanged = editedEmpDeptPos && JSON.stringify(editedEmpDeptPos) !== JSON.stringify(originalEmpDeptPos);
      if (empDeptPosChanged && editedEmpDeptPos.EdpID && (editedEmpDeptPos.DeptID || editedEmpDeptPos.PositionID)) {
        console.log('Updating employee department and position:', editedEmpDeptPos);
        const updateData = {
          EdpID: editedEmpDeptPos.EdpID,
          EmpID: parseInt(id),
          DeptID: editedEmpDeptPos.DeptID,
          PositionID: editedEmpDeptPos.PositionID,
          ...(editedEmpDeptPos.EmpTypeID && { EmpTypeID: editedEmpDeptPos.EmpTypeID })
        };
        await updateEmpDeptPos(updateData);
        setEmpDeptPos(editedEmpDeptPos);
        hasChanges = true;
      }

      if (hasChanges) {
        notify.success('Employee details updated successfully');
      } else {
        notify.info('No changes detected');
      }

      setIsEditMode(false);

      // Refresh data only if there were changes
      if (hasChanges) {
        await fetchEmployeeDetails();
        await fetchEmpDeptPos(id);
        await fetchReportingManagers(id);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      notify.error('Failed to save changes: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeFieldChange = (field, value) => {
    setEditedEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankFieldChange = (field, value) => {
    setEditedBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error for this field
    setBankValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleAcademicFieldChange = (index, field, value) => {
    setEditedAcademicDetails(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleProfessionalFieldChange = (index, field, value) => {
    setEditedProfessionalDetails(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleEmpDeptPosFieldChange = async (field, value) => {
    // If department is changed, fetch positions for that department and clear position selection
    if (field === 'DeptID') {
      setEditedEmpDeptPos(prev => ({
        ...prev,
        DeptID: value,
        PositionID: null // Clear position when department changes
      }));

      // Fetch positions for the selected department
      if (value) {
        try {
          const filteredPositions = await getPositionsByDepartment(value);
          console.log('Positions for department:', filteredPositions);
          setPositions(filteredPositions);
        } catch (error) {
          console.error('Error fetching positions for department:', error);
          // notify.error('Failed to fetch positions for selected department');
          setPositions([]);
        }
      } else {
        // If no department selected, clear positions
        setPositions([]);
      }
    } else {
      // For other fields (like PositionID), just update the value
      setEditedEmpDeptPos(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleReportingManagerToggle = (managerId) => {
    setEditedReportingManagerIds(prev => {
      if (prev.includes(managerId)) {
        return prev.filter(id => id !== managerId);
      } else {
        return [...prev, managerId];
      }
    });
  };

  const filteredReportingManagers = availableManagers.filter(manager =>
    `${manager.FirstName} ${manager.LastName}`.toLowerCase().includes(reportingManagersSearchTerm.toLowerCase())
  );

  const getManagerName = (managerId) => {
    // First try to find in availableManagers
    let manager = availableManagers.find(m => m.EmpID === managerId);
    if (manager) {
      return `${manager.FirstName} ${manager.LastName}`;
    }

    // Fallback to reportingManagers if not found in availableManagers
    manager = reportingManagers.find(m => m.EmpID === managerId);
    if (manager) {
      return `${manager.FirstName} ${manager.LastName}`;
    }

    // Last resort fallback
    return `Manager ${managerId}`;
  };

  const handleMarkOBComplete = async () => {
    try {
      setIsSaving(true);

      // Update employee OB Status to true
      const updatedEmployee = {
        ...employee,
        OBStatus: true
      };

      await EmployeeService.updateEmployee(id, updatedEmployee);
      setEmployee(updatedEmployee);

      notification.success('Employee OB Status marked as complete');

      // Refresh data
      await fetchEmployeeDetails();
    } catch (error) {
      console.error('Error updating OB Status:', error);
      notification.error('Failed to update OB Status: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsTogglingStatus(true);

      console.log('Toggling employee status for ID:', id);
      const response = await EmployeeService.toggleEmployeeStatus(id);

      // Update local state with the new status
      const updatedEmployee = {
        ...employee,
        IsActive: !employee.IsActive
      };
      setEmployee(updatedEmployee);

      const statusText = updatedEmployee.IsActive ? 'Active' : 'Inactive';
      notify.success(`Employee status changed to ${statusText}`);
    } catch (error) {
      console.error('Error updating employee status:', error);
      notify.error('Failed to update employee status: ' + error.message);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleOpenTerminateModal = () => {
    setTerminateData({
      DateofLeaving: '',
      TerminateReasonOrLeavingReason: ''
    });
    setTerminateModalOpen(true);
  };

  const handleCloseTerminateModal = () => {
    setTerminateModalOpen(false);
    setTerminateData({
      DateofLeaving: '',
      TerminateReasonOrLeavingReason: ''
    });
  };

  const handleTerminateSubmit = async () => {
    if (!terminateData.DateofLeaving) {
      notify.error('Please select a date of leaving');
      return;
    }

    try {
      setIsTerminating(true);
      await API.patch(`/Employees/TerminateorResign/${id}`, terminateData);
      
      notify.success('Employee terminated/resigned successfully');
      handleCloseTerminateModal();
      
      // Refresh employee details to get updated data from server
      await fetchEmployeeDetails();
    } catch (error) {
      console.error('Error terminating employee:', error);
      notify.error('Failed to terminate employee: ' + error.message);
    } finally {
      setIsTerminating(false);
    }
  };

  const handleOpenRehireModal = () => {
    setRehireDate('');
    setRehireModalOpen(true);
  };

  const handleCloseRehireModal = () => {
    setRehireModalOpen(false);
    setRehireDate('');
  };

  const handleRehireSubmit = async () => {
    if (!rehireDate) {
      notify.error('Please select a rehire date');
      return;
    }

    try {
      setIsRehiring(true);
      const response = await API.patch(`/Employees/Rehire/${id}`, {
        DateofRehire: rehireDate
      });
      
      notify.success('Employee rehired successfully');
      handleCloseRehireModal();
      
      // Refresh employee details to get updated data from server
      await fetchEmployeeDetails();
    } catch (error) {
      console.error('Error rehiring employee:', error);
      notify.error('Failed to rehire employee: ' + error.message);
    } finally {
      setIsRehiring(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading employee details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard/all-employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Employees
          </Link>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The employee with ID {id} could not be found.</p>
          <Link
            to="/dashboard/all-employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard/all-employees"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to All Employees
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.FirstName} {employee.LastName}
            </h1>
            <p className="text-gray-600">
              EMP{employee.EmpID.toString().padStart(3, '0')} •
              Attendance Code: {employee.AtdEmpCode || '0'} •
              Role ID: {employee.RoleID} •
              OB Status: {employee.OBStatus ? 'Completed' : 'Pending'}
            </p>
            {/* Status Toggle */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors ${employee.IsActive
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${employee.IsActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`text-sm font-semibold ${employee.IsActive
                ? 'text-green-600'
                : 'text-red-600'
                }`}>
                {isTogglingStatus ? 'Updating...' : (employee.IsActive ? 'Active' : 'Inactive')}
              </span>
            </div>
          </div>
          {canEdit &&
            <div className="flex gap-2">

              {!isEditMode ? (
                <>
                  <button
                    onClick={handleEditMode}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 size={16} />
                    Edit Details
                  </button>
                  {!employee.OBStatus && (
                    <button
                      onClick={handleMarkOBComplete}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      {isSaving ? 'Updating...' : 'Mark OB Complete'}
                    </button>
                  )}
                  {/* Terminate/Rehire Button */}
                  {!employee.IsActive && employee.DateofLeaving ? (
                    <button
                      onClick={handleOpenRehireModal}
                      disabled={isRehiring}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Users size={16} />
                      {isRehiring ? 'Processing...' : 'Rehire'}
                    </button>
                  ) : employee.IsActive ? (
                    <button
                      onClick={handleOpenTerminateModal}
                      disabled={isTerminating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                      {isTerminating ? 'Processing...' : 'Terminate or Resign'}
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>}

        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic Information */}
        <InfoCard title="Basic Information" icon={User} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-2">
              <InfoRow
                label="First Name"
                value={isEditMode ? editedEmployee?.FirstName : employee.FirstName}
                isEditable={true}
                field="FirstName"
                onChange={handleEmployeeFieldChange}
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Last Name"
                value={isEditMode ? editedEmployee?.LastName : employee.LastName}
                isEditable={true}
                field="LastName"
                onChange={handleEmployeeFieldChange}
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Personal Email"
                value={isEditMode ? editedEmployee?.PersonalEmail : employee.PersonalEmail}
                isEditable={true}
                field="PersonalEmail"
                onChange={handleEmployeeFieldChange}
                type="email"
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Work Email"
                value={isEditMode ? editedEmployee?.WorkEmail : employee.WorkEmail}
                isEditable={true}
                field="WorkEmail"
                onChange={handleEmployeeFieldChange}
                type="email"
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Phone Number"
                value={isEditMode ? editedEmployee?.PhoneNumber : employee.PhoneNumber}
                isEditable={true}
                field="PhoneNumber"
                onChange={handleEmployeeFieldChange}
                type="tel"
                isEditMode={isEditMode}
              />
              <InfoRow label="Employee ID" value={`EMP${employee.EmpID.toString().padStart(3, '0')}`} />
              <InfoRow
                label="Attendance Code"
                value={isEditMode ? editedEmployee?.AtdEmpCode || '0' : employee.AtdEmpCode || '0'}
                isEditable={true}
                field="AtdEmpCode"
                onChange={handleEmployeeFieldChange}
                type="number"
                isEditMode={isEditMode}
              />

            </div>
            <div className="space-y-2">
              <InfoRow
                label="Address"
                value={isEditMode ? editedEmployee?.Address : employee.Address}
                isEditable={true}
                field="Address"
                onChange={handleEmployeeFieldChange}
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Emergency Contact"
                value={isEditMode ? editedEmployee?.EmergencyContact : employee.EmergencyContact}
                isEditable={true}
                field="EmergencyContact"
                onChange={handleEmployeeFieldChange}
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Emergency Phone"
                value={isEditMode ? editedEmployee?.EmergencyContactNumber : employee.EmergencyContactNumber}
                isEditable={true}
                field="EmergencyContactNumber"
                onChange={handleEmployeeFieldChange}
                type="tel"
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Date of Birth"
                value={isEditMode
                  ? editedEmployee?.DateOfBirth?.split('T')[0]
                  : employee.DateOfBirth ? new Date(employee.DateOfBirth).toLocaleDateString() : 'Not provided'
                }
                isEditable={true}
                field="DateOfBirth"
                onChange={handleEmployeeFieldChange}
                type="date"
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Gender"
                value={isEditMode ? editedEmployee?.Gender : employee.Gender}
                isEditable={true}
                field="Gender"
                onChange={handleEmployeeFieldChange}
                isEditMode={isEditMode}
              />
              <InfoRow
                label="Date of Joining"
                value={isEditMode
                  ? editedEmployee?.DateOfJoining?.split('T')[0]
                  : employee.DateOfJoining ? new Date(employee.DateOfJoining).toLocaleDateString() : 'Not provided'
                }
                isEditable={true}
                field="DateOfJoining"
                onChange={handleEmployeeFieldChange}
                type="date"
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </InfoCard>

        {/* Current Salary / CTC Information */}
        <InfoCard title="Current Salary" icon={TrendingUp} className="lg:col-span-2">
          {currentSalaryLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading salary information...</p>
            </div>
          ) : currentSalaryError ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-red-500">Error loading salary information</p>
              <p className="text-sm text-gray-400 mt-2">{currentSalaryError}</p>
            </div>
          ) : currentSalary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow
                label="CTC Amount"
                value={`₹${currentSalary.CtcAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <InfoRow
                label="Effective Date"
                value={currentSalary.EffectiveDate ? new Date(currentSalary.EffectiveDate).toLocaleDateString() : 'N/A'}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No salary information found.</p>
            </div>
          )}
        </InfoCard>


        {/* Department & Position Information */}
        <InfoCard title="Department & Position" icon={Building} className="lg:col-span-2">
          {empDeptPosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading department and position information...</p>
            </div>
          ) : empDeptPosError ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-red-500">Error loading department and position information</p>
              <p className="text-sm text-gray-400 mt-2">{empDeptPosError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRowDropdown
                label="Department"
                value={isEditMode ? editedEmpDeptPos?.DeptID : empDeptPos?.DeptID}
                options={departments}
                field="DeptID"
                onChange={handleEmpDeptPosFieldChange}
                isEditMode={isEditMode}
                valueKey="DeptID"
                labelKey="DeptName"
              />
              <InfoRowDropdown
                label="Position"
                value={isEditMode ? editedEmpDeptPos?.PositionID : empDeptPos?.PositionID}
                options={positions}
                field="PositionID"
                onChange={handleEmpDeptPosFieldChange}
                isEditMode={isEditMode}
                valueKey="PositionID"
                labelKey="PositionName"
              />
            </div>
          )}
          {/* Reporting Managers */}
          <div className="py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700 mb-2 block">Reporting Managers:</span>
            {availableManagersLoading ? (
              <div className="text-sm text-gray-500">Loading managers...</div>
            ) : availableManagersError ? (
              <div className="text-sm text-red-500">{availableManagersError}</div>
            ) : isEditMode ? (
              <div className="relative">
                {/* Multi-select dropdown trigger */}
                <button
                  onClick={() => setReportingManagersDropdownOpen(!reportingManagersDropdownOpen)}
                  className="w-full px-3 py-2 text-left bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 flex items-center justify-between"
                >
                  <span>
                    {editedReportingManagerIds.length === 0
                      ? 'Select reporting managers...'
                      : `${editedReportingManagerIds.length} selected`}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${reportingManagersDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {reportingManagersDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search managers..."
                        value={reportingManagersSearchTerm}
                        onChange={(e) => setReportingManagersSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredReportingManagers.length > 0 ? (
                        filteredReportingManagers.map(manager => (
                          <label
                            key={manager.EmpID}
                            className="flex items-start gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={editedReportingManagerIds.includes(manager.EmpID)}
                              onChange={() => handleReportingManagerToggle(manager.EmpID)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="text-gray-700 text-sm font-medium">{manager.FirstName} {manager.LastName}</div>
                              <div className="text-gray-500 text-xs">{manager.Department} • {manager.Position}</div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-gray-500">
                          No managers found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected items display */}
                {editedReportingManagerIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editedReportingManagerIds.map(managerId => (
                      <div
                        key={managerId}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <span>{getManagerName(managerId)}</span>
                        <button
                          onClick={() => handleReportingManagerToggle(managerId)}
                          className="text-blue-700 hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600">
                {reportingManagers && reportingManagers.length > 0 ? (
                  <ul className="space-y-1">
                    {reportingManagers.map(manager => (
                      <li key={manager.EmpID} className="text-sm">
                        {manager.FirstName} {manager.LastName}
                        {manager.Department && ` (${manager.Department})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>Not assigned</span>
                )}
              </div>
            )}
          </div>
        </InfoCard>


        {/* Bank Information */}
        <InfoCard title="Bank Information" icon={CreditCard} className="lg:col-span-2">
          {bankLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bank information...</p>
            </div>
          ) : bankError ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-red-500">Error loading bank information</p>
              <p className="text-sm text-gray-400 mt-2">{bankError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show message if no bank details exist and not in edit mode */}
              {!bankDetails && !isEditMode && (
                <div className="text-center py-4 bg-blue-50 rounded-md border border-blue-200">
                  <Info className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-blue-700 font-medium">No bank details added yet</p>
                  <p className="text-sm text-blue-600 mt-1">Click "Edit Details" to add bank information</p>
                </div>
              )}

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                {isEditMode ? (
                  <>
                    <select
                      name="BankName"
                      value={editedBankDetails?.BankName || ''}
                      onChange={(e) => handleBankFieldChange('BankName', e.target.value)}
                      className={`w-full px-3 py-2 text-lg bg-gray-50 rounded-md border ${bankValidationErrors.BankName ? 'border-red-500' : 'border-gray-200'
                        } font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select bank</option>
                      {banks.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                    {bankValidationErrors.BankName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <Info className="w-3 h-3 mr-1" />
                        {bankValidationErrors.BankName}
                      </p>
                    )}
                  </>
                ) : bankDetails ? (
                  <div className="w-full px-3 py-2 text-lg bg-gray-50 rounded-md border border-gray-200 font-semibold text-gray-700">
                    {bankDetails.BankName || 'Not provided'}
                  </div>
                ) : null}
              </div>

              {/* Account Number and IFSC Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number</label>
                  {isEditMode ? (
                    <>
                      <input
                        name="AccountNumber"
                        value={editedBankDetails?.AccountNumber || ''}
                        onChange={(e) => handleBankFieldChange('AccountNumber', e.target.value)}
                        className={`w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border ${bankValidationErrors.AccountNumber ? 'border-red-500' : 'border-gray-200'
                          } font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {bankValidationErrors.AccountNumber && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <Info className="w-3 h-3 mr-1" />
                          {bankValidationErrors.AccountNumber}
                        </p>
                      )}
                    </>
                  ) : bankDetails ? (
                    <div className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-200 font-mono text-lg tracking-wider">
                      {bankDetails.AccountNumber || 'Not provided'}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">IFSC Code</label>
                  {isEditMode ? (
                    <>
                      <input
                        name="IFSCCode"
                        value={editedBankDetails?.IFSCCode || ''}
                        maxLength={11}
                        onChange={(e) => handleBankFieldChange('IFSCCode', e.target.value.toUpperCase())}
                        className={`w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border ${bankValidationErrors.IFSCCode ? 'border-red-500' : 'border-gray-200'
                          } font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {bankValidationErrors.IFSCCode && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <Info className="w-3 h-3 mr-1" />
                          {bankValidationErrors.IFSCCode}
                        </p>
                      )}
                    </>
                  ) : bankDetails ? (
                    <div className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-200 font-mono text-lg tracking-widest uppercase">
                      {bankDetails.IFSCCode || 'Not provided'}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Branch Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Branch Name</label>
                {isEditMode ? (
                  <>
                    <input
                      name="BranchName"
                      type="text"
                      value={editedBankDetails?.BranchName || ''}
                      onChange={(e) => handleBankFieldChange('BranchName', e.target.value)}
                      className={`w-full px-3 py-2 text-lg bg-gray-50 rounded-md border ${bankValidationErrors.BranchName ? 'border-red-500' : 'border-gray-200'
                        } font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {bankValidationErrors.BranchName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <Info className="w-3 h-3 mr-1" />
                        {bankValidationErrors.BranchName}
                      </p>
                    )}
                  </>
                ) : bankDetails ? (
                  <div className="w-full px-3 py-2 text-lg bg-gray-50 rounded-md border border-gray-200 font-semibold text-gray-700">
                    {bankDetails.BranchName || 'Not provided'}
                  </div>
                ) : null}
              </div>

              {/* UAN Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">UAN Number</label>
                {isEditMode ? (
                  <>
                    <input
                      name="UAN"
                      type="text"
                      value={editedBankDetails?.UAN || ''}
                      onChange={(e) => handleBankFieldChange('UAN', e.target.value)}
                      maxLength={12}
                      className={`w-full px-3 py-2 text-lg bg-gray-50 rounded-md border ${bankValidationErrors.UAN ? 'border-red-500' : 'border-gray-200'
                        } font-mono text-gray-700 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter 12-digit UAN"
                    />
                    {bankValidationErrors.UAN && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <Info className="w-3 h-3 mr-1" />
                        {bankValidationErrors.UAN}
                      </p>
                    )}
                  </>
                ) : bankDetails ? (
                  <div className="w-full px-3 py-2 text-lg bg-gray-50 rounded-md border border-gray-200 font-mono text-gray-700 tracking-wider">
                    {bankDetails.UAN || 'Not provided'}
                  </div>
                ) : null}
              </div>

              {/* Additional Info - Only show if bank details exist */}
              {bankDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 mb-1">Bank Detail ID</span>
                    <span className="text-gray-700">{bankDetails.EbdID || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 mb-1">Cancelled Cheque</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{bankDetails.CancelledCheque ? 'Uploaded' : 'Not uploaded'}</span>
                      {bankDetails.CancelledCheque && (
                        <button
                          onClick={() => handlePreviewDocument(bankDetails.CancelledCheque, 'Cancelled Cheque')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </InfoCard>

        {/* Academic Information */}
        <InfoCard title="Academic Information" icon={GraduationCap} className="lg:col-span-2">
          {academicLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading academic information...</p>
            </div>
          ) : academicError ? (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-500">Failed to load academic information</p>
              <p className="text-sm text-gray-400 mt-2">{academicError}</p>
            </div>
          ) : academicDetails && academicDetails.length > 0 ? (
            <div className="space-y-4">
              {(isEditMode ? editedAcademicDetails : academicDetails).map((academic, index) => (
                <div key={academic.EadID || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      label="Qualification"
                      value={academic.Qualification}
                      isEditable={true}
                      field="Qualification"
                      onChange={(field, value) => handleAcademicFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Degree"
                      value={academic.Degree}
                      isEditable={true}
                      field="Degree"
                      onChange={(field, value) => handleAcademicFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Institution"
                      value={academic.Institution}
                      isEditable={true}
                      field="Institution"
                      onChange={(field, value) => handleAcademicFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Year of Passing"
                      value={academic.YearOfPassing}
                      isEditable={true}
                      field="YearOfPassing"
                      onChange={(field, value) => handleAcademicFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Grade"
                      value={academic.Grade}
                      isEditable={true}
                      field="Grade"
                      onChange={(field, value) => handleAcademicFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No academic information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Academic details may not have been added yet.</p>
            </div>
          )}
        </InfoCard>

        {/* Professional Information */}
        <InfoCard title="Professional Information" icon={Settings} className="lg:col-span-2">
          {professionalLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading professional information...</p>
            </div>
          ) : professionalError ? (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-500">Failed to load professional information</p>
              <p className="text-sm text-gray-400 mt-2">{professionalError}</p>
            </div>
          ) : professionalDetails && professionalDetails.length > 0 ? (
            <div className="space-y-4">
              {(isEditMode ? editedProfessionalDetails : professionalDetails).map((prof, index) => (
                <div key={prof.EpdID || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      label="Previous Company"
                      value={prof.PreviousCompany}
                      isEditable={true}
                      field="PreviousCompany"
                      onChange={(field, value) => handleProfessionalFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Previous Position"
                      value={prof.PreviousPosition}
                      isEditable={true}
                      field="PreviousPosition"
                      onChange={(field, value) => handleProfessionalFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRow
                      label="Previous Experience"
                      value={prof.PreviousExperience}
                      isEditable={true}
                      field="PreviousExperience"
                      onChange={(field, value) => handleProfessionalFieldChange(index, field, value)}
                      isEditMode={isEditMode}
                    />
                    <InfoRowWithPreview
                      label="Experience Certificate"
                      value={prof.PreviousExperienceCeritificate ? 'Uploaded' : 'Not uploaded'}
                      documentPath={prof.PreviousExperienceCeritificate}
                      documentName="Experience Certificate"
                      onPreview={handlePreviewDocument}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No professional information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Professional details may not have been added yet.</p>
            </div>
          )}
        </InfoCard>

        {/* Documents */}
        <InfoCard title="Documents" icon={FileText} className="lg:col-span-2">
          {documentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documentError ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Failed to load documents</p>
              <p className="text-sm text-gray-400 mt-2">Documents may not have been added yet.</p>
            </div>
          ) : documentDetails && documentDetails.length > 0 ? (
            <div className="space-y-4">
              {documentDetails.map((document, index) => (
                <div key={document.EmpDocId || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{document.DocName}</h4>
                      <div className="space-y-1">
                        <InfoRow label="Document Number" value={document.DocIDNumber} />
                        <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Document:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Available</span>
                            <button
                              onClick={() => handlePreviewDocument(document.DocPath, document.DocName)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No documents found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Documents may not have been uploaded yet.</p>
            </div>
          )}
        </InfoCard>
        {/* Performance Reviews */}
        <InfoCard title="Performance Reviews" icon={ClipboardList} className="lg:col-span-2">
          {performanceLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading performance reviews...</p>
            </div>
          ) : performanceReviews && performanceReviews.length > 0 ? (
            <div className="space-y-4">
              {performanceReviews.map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Review Date" value={new Date(review.SubmittedAt || review.AppraisalDate).toLocaleDateString()} />
                    <InfoRow label="Final Score" value={`${review.FinalPercentage || review.FinalScore}%`} />
                    <InfoRow label="Rating" value={review.Rating} />
                    <InfoRow label="Reviewed By" value={review.ReviewedBy || 'N/A'} />
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Comments:</span>
                      <p className="text-gray-600 mt-1 text-sm italic">"{review.FinalRemark || review.Comments || 'No comments'}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No performance reviews found.</p>
            </div>
          )}
        </InfoCard>

        {/* Increment History */}
        <InfoCard title="Increment History" icon={TrendingUp} className="lg:col-span-2">
          {incrementLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading increment history...</p>
            </div>
          ) : incrementHistory && incrementHistory.length > 0 ? (
            <div className="space-y-4">
              {incrementHistory.map((increment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow label="Previous CTC" value={`₹${increment.PreviousCTC?.toLocaleString()}`} />
                    <InfoRow label="Increment %" value={`${increment.IncrementPercentage}%`} />
                    <InfoRow label="Increment Amount" value={`₹${increment.IncrementAmount?.toLocaleString()}`} />
                    <InfoRow label="New CTC" value={`₹${increment.NewCTC?.toLocaleString()}`} />
                    <InfoRow label="WEF Date" value={new Date(increment.WEFDate).toLocaleDateString()} />
                    <InfoRow label="Status" value={increment.ApprovalStatus} />
                    <InfoRow label="Processed" value={increment.IsProcessed ? 'Yes' : 'No'} />
                    {increment.ArrearsAmount > 0 && (
                      <InfoRow label="Arrears" value={`₹${increment.ArrearsAmount?.toLocaleString()}`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No increment history found.</p>
            </div>
          )}
        </InfoCard>

        {/* Loan History */}
        <InfoCard title="Loan History" icon={Wallet} className="lg:col-span-2">
          {loanLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading loan history...</p>
            </div>
          ) : loanHistory && loanHistory.length > 0 ? (
            <div className="space-y-4">
              {loanHistory.map((loan, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Amount" value={`₹${loan.LoanAmount?.toLocaleString()}`} />
                    <InfoRow label="Type" value={loan.IsArrearOrAdvance === 2 ? 'Advance' : 'Loan'} />
                    <InfoRow label="Status" value={loan.IsApproved ? 'Approved' : 'Pending'} />
                    <InfoRow label="Date" value={new Date(loan.StartDate).toLocaleDateString()} />
                    <InfoRow label="Force Closed" value={loan.isForceClosed ? 'Yes' : 'No'} />
                    <InfoRow label="Monthly Installment" value={`₹${loan.Installment?.toLocaleString()}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No loan history found.</p>
            </div>
          )}
        </InfoCard>

        {/* Leave History */}
        <InfoCard title="Leave History" icon={CalendarDays} className="lg:col-span-2">
          {leaveLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading leave history...</p>
            </div>
          ) : leaveHistory && leaveHistory.length > 0 ? (
            <div className="space-y-4">
              {leaveHistory.map((leave, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Leave Type" value={leave.LeaveType} />
                    <InfoRow label="Status" value={leave.IsApproved == true ? 'Approved' : leave.IsApproved === false ? 'Rejected' : 'Pending'} />
                    <InfoRow label="Start Date" value={new Date(leave.StartDate).toLocaleDateString()} />
                    <InfoRow label="End Date" value={new Date(leave.EndDate).toLocaleDateString()} />
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-600 mt-1 text-sm">{leave.LeaveReason || 'No reason provided'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No leave history found.</p>
            </div>
          )}
        </InfoCard>

      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        documentUrl={previewModal.documentUrl}
        documentName={previewModal.documentName}
      />

      {/* Terminate/Resign Modal */}
      {terminateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Terminate or Resign Employee</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Leaving <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={terminateData.DateofLeaving}
                    onChange={(e) => setTerminateData(prev => ({ ...prev, DateofLeaving: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={terminateData.TerminateReasonOrLeavingReason}
                    onChange={(e) => setTerminateData(prev => ({ ...prev, TerminateReasonOrLeavingReason: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter reason for termination or resignation..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleTerminateSubmit}
                  disabled={isTerminating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTerminating ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={handleCloseTerminateModal}
                  disabled={isTerminating}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rehire Modal */}
      {rehireModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rehire Employee</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Rehire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={rehireDate}
                    onChange={(e) => setRehireDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {employee.DateofLeaving && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Previous Leaving Date:</span>{' '}
                      {new Date(employee.DateofLeaving).toLocaleDateString()}
                    </p>
                    {employee.TerminateReasonOrLeavingReason && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Previous Reason:</span>{' '}
                        {employee.TerminateReasonOrLeavingReason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRehireSubmit}
                  disabled={isRehiring}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRehiring ? 'Processing...' : 'Confirm Rehire'}
                </button>
                <button
                  onClick={handleCloseRehireModal}
                  disabled={isRehiring}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;