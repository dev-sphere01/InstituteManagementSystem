/**
 * ViewAllReviewsTab Component
 * 
 * Refactored tab for HR department to view and manage employee reviews
 * Features:
 * - Nested tabs for Single Reviews, Multiple Reviews, and View All Reviews
 * - Employee selection with search for each tab
 * - Display reviews for selected employee
 * - Review detail display
 * - Regularization (edit) functionality for HR
 * - Download Report functionality for each tab
 * 
 * This component maintains all original functionality while adding new nested tabs
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Users, FolderOpen, X, Edit, Download } from 'lucide-react'
import { notification } from '@/services'
import API from '@/services/API'
import ReviewDetailModal from '../components/ReviewDetailModal'
import RegularizationModal from '../components/RegularizationModal'
import { calculateRating } from '../utils/ratingHelpers'

// Tab types
const NESTED_TABS = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  ALL: 'all'
}

// Employee Search Dropdown Component (Memoized to prevent re-renders)
const EmployeeSearchDropdown = React.memo(({
  search,
  onSearchChange,
  onSelect,
  filteredEmployees,
  showDropdown,
  setShowDropdown,
  selectedEmpId,
  onClear,
  dropdownRef,
  inputRef
}) =>
{
  const [justSelected, setJustSelected] = useState(false)
  // Handle click outside to close dropdown
  useEffect(() =>
  {
    const handleClickOutside = (event) =>
    {
      if (dropdownRef?.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
    {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setShowDropdown, dropdownRef])

  const handleInputFocus = () =>
  {
    // Don't show dropdown if we just selected an employee
    if (!justSelected) {
      setShowDropdown(true)
    }
  }

  const handleEmployeeSelect = (emp) =>
  {
    setJustSelected(true)
    onSelect(emp)
    setShowDropdown(false)
    inputRef?.current?.blur()
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setJustSelected(false)
    }, 100)
  }

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="block relative">
        <span className="text-gray-700 font-medium mb-2 block">Select Employee</span>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={() => {
              // Close dropdown when input loses focus (with a small delay to allow for clicks)
              setTimeout(() => {
                setShowDropdown(false)
              }, 150)
            }}
            placeholder="Search by name or ID..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {selectedEmpId && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {showDropdown && filteredEmployees.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.EmpID}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur on mousedown
                onClick={() => handleEmployeeSelect(emp)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">
                  {emp.EmpID} - {emp.FirstName} {emp.LastName}
                </div>
                <div className="text-sm text-gray-500">{emp.Email}</div>
              </div>
            ))}
          </div>
        )}
      </label>
    </div>
  )
})

const ViewAllReviewsTab = ({
  // Props from HrSideForm - using the exact same structure
  showViewAllReviewsTab,
  allReviewsEmployees = [],
  filteredAllReviewsEmployees = [],
  selectedReviewEmployee,
  selectedReviewEmpId,
  reviewEmployeeSearch = '',
  showReviewEmployeeDropdown = false,
  reviewEmployeeDropdownRef,
  reviewEmployeeInputRef,
  allEmployeeReviews = [],
  loadingAllReviews = false,
  selectedReviewDetail,
  reviewerNames = {},

  // Regularization states
  selectedReviewForRegularization,
  regularizationFormData = {
    SelfDevelopment: 0,
    EmployeeStaffDevelopment: 0,
    DecisionMaking: 0,
    ProductivityEfficiency: 0,
    CallForDuty: 0,
    AttendancePunctuality: 0,
    BehaviourOverallDiscipline: 0,
    Integrity: 0,
    LoyaltySubmissionToCompanyGoals: 0,
    FinalRemark: ''
  },
  isSubmittingRegularization = false,

  // Handlers
  handleReviewEmployeeSelect = () => { },
  handleReviewEmployeeSearchChange = () => { },
  setShowReviewEmployeeDropdown = () => { },
  setSelectedReviewDetail = () => { },
  handleRegularizeClick = () => { },
  handleRegularizationFormChange = () => { },
  calculateRegularizationScores = () => ({ performanceScore: 0, disciplineScore: 0, integrityScore: 0, finalPercentage: 0 }),
  handleSubmitRegularization = () => { },
  handleCancelRegularization = () => { },

  // Props
  areReviewsLocked = false,
  selectedSessionId = null,
  currentEmployee = {},

  // Clear selection handler
  clearReviewSelection,
  clearSelection
}) =>
{
  const notify = notification()

  // Nested tab state
  const [activeNestedTab, setActiveNestedTab] = useState(NESTED_TABS.SINGLE)

  // States for Single Reviews tab
  const [singleReviewsEmployees, setSingleReviewsEmployees] = useState([])
  const [filteredSingleReviewsEmployees, setFilteredSingleReviewsEmployees] = useState([])
  const [selectedSingleReviewEmpId, setSelectedSingleReviewEmpId] = useState(null)
  const [selectedSingleReviewEmployee, setSelectedSingleReviewEmployee] = useState(null)
  const [singleReviewEmployeeSearch, setSingleReviewEmployeeSearch] = useState('')
  const [showSingleReviewEmployeeDropdown, setShowSingleReviewEmployeeDropdown] = useState(false)
  const [singleReviewsData, setSingleReviewsData] = useState([])
  const [loadingSingleReviews, setLoadingSingleReviews] = useState(false)
  const [singleReviewsReviewerNames, setSingleReviewsReviewerNames] = useState({})

  // States for Multiple Reviews tab
  const [multipleReviewsEmployees, setMultipleReviewsEmployees] = useState([])
  const [filteredMultipleReviewsEmployees, setFilteredMultipleReviewsEmployees] = useState([])
  const [selectedMultipleReviewEmpId, setSelectedMultipleReviewEmpId] = useState(null)
  const [selectedMultipleReviewEmployee, setSelectedMultipleReviewEmployee] = useState(null)
  const [multipleReviewEmployeeSearch, setMultipleReviewEmployeeSearch] = useState('')
  const [showMultipleReviewEmployeeDropdown, setShowMultipleReviewEmployeeDropdown] = useState(false)
  const [multipleReviewsData, setMultipleReviewsData] = useState([])
  const [loadingMultipleReviews, setLoadingMultipleReviews] = useState(false)
  const [multipleReviewsReviewerNames, setMultipleReviewsReviewerNames] = useState({})

  // Refs for dropdown management
  const singleReviewDropdownRef = useRef(null)
  const multipleReviewDropdownRef = useRef(null)
  const singleReviewInputRef = useRef(null)
  const multipleReviewInputRef = useRef(null)

  // Memoized clear handlers
  const handleClearSingleReview = useCallback(() =>
  {
    setSelectedSingleReviewEmpId(null)
    setSingleReviewEmployeeSearch('')
    setSingleReviewsData([])
    setSingleReviewsReviewerNames({})
  }, [])

  const handleClearMultipleReview = useCallback(() =>
  {
    setSelectedMultipleReviewEmpId(null)
    setMultipleReviewEmployeeSearch('')
    setMultipleReviewsData([])
    setMultipleReviewsReviewerNames({})
  }, [])

  // Download states
  const [downloadingSingleReport, setDownloadingSingleReport] = useState(false)
  const [downloadingMultipleReport, setDownloadingMultipleReport] = useState(false)

  // State for modals in nested tabs
  const [selectedReviewDetailLocal, setSelectedReviewDetailLocal] = useState(null)
  const [selectedReviewForRegularizationLocal, setSelectedReviewForRegularizationLocal] = useState(null)
  const [regularizationFormDataLocal, setRegularizationFormDataLocal] = useState({
    SelfDevelopment: 0,
    EmployeeStaffDevelopment: 0,
    DecisionMaking: 0,
    ProductivityEfficiency: 0,
    CallForDuty: 0,
    AttendancePunctuality: 0,
    BehaviourOverallDiscipline: 0,
    Integrity: 0,
    LoyaltySubmissionToCompanyGoals: 0,
    FinalRemark: ''
  })
  const [isSubmittingRegularizationLocal, setIsSubmittingRegularizationLocal] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

  // Create a default clear function if not provided
  const handleClearSelection = clearReviewSelection || clearSelection || (() =>
  {
    if (handleReviewEmployeeSearchChange) {
      handleReviewEmployeeSearchChange('')
    }
    if (setSelectedReviewDetail) {
      setSelectedReviewDetail(null)
    }
  })

  // Fetch Single Reviews Employees
  const fetchSingleReviewsEmployees = async () =>
  {
    try {
      if (!selectedSessionId) {
        notify.error('Session not selected')
        return
      }

      const response = await API.get(`/EmpAssessments/GetEmployeeswithSingleReviews/${selectedSessionId}`)
      setSingleReviewsEmployees(response.data || [])
      setFilteredSingleReviewsEmployees(response.data || [])
    } catch (error) {
      console.error('Error fetching single reviews employees:', error)
      notify.error('Failed to fetch employees with single reviews')
    }
  }

  // Fetch Multiple Reviews Employees
  const fetchMultipleReviewsEmployees = async () =>
  {
    try {
      if (!selectedSessionId) {
        notify.error('Session not selected')
        return
      }

      const response = await API.get(`/EmpAssessments/GetEmployeeswithMultipleReviews/${selectedSessionId}`)
      setMultipleReviewsEmployees(response.data || [])
      setFilteredMultipleReviewsEmployees(response.data || [])
    } catch (error) {
      console.error('Error fetching multiple reviews employees:', error)
      notify.error('Failed to fetch employees with multiple reviews')
    }
  }

  // Fetch reviewer names
  const fetchReviewerNames = async (reviewerIds) =>
  {
    const names = {}
    try {
      const uniqueIds = [...new Set(reviewerIds.filter(id => id))]

      for (const reviewerId of uniqueIds) {
        try {
          const response = await API.get(`/Employees/${reviewerId}`)
          if (response.data) {
            names[reviewerId] = `${response.data.FirstName} ${response.data.LastName}`
          }
        } catch (error) {
          console.error(`Error fetching reviewer ${reviewerId}:`, error)
          names[reviewerId] = 'Unknown Reviewer'
        }
      }
    } catch (error) {
      console.error('Error fetching reviewer names:', error)
    }
    return names
  }

  // Fetch reviews for selected employee (Single Reviews)
  const fetchSingleReviewsForEmployee = async (empId) =>
  {
    try {
      setLoadingSingleReviews(true)
      // TODO: Replace with actual API endpoint when available
      // For now, using placeholder - adjust based on your actual API
      const response = await API.get(`/EmpAssessments/GetAllreviews/${empId}/${selectedSessionId}`)
      const reviews = response.data || []
      setSingleReviewsData(reviews)

      // Fetch reviewer names for these reviews
      const reviewerIds = reviews.map(review => review.SubmittedBy).filter(Boolean)
      if (reviewerIds.length > 0) {
        const names = await fetchReviewerNames(reviewerIds)
        setSingleReviewsReviewerNames(names)
      }
    } catch (error) {
      console.error('Error fetching single reviews:', error)
      notify.error('Failed to fetch reviews')
      setSingleReviewsData([])
    } finally {
      setLoadingSingleReviews(false)
    }
  }

  // Fetch reviews for selected employee (Multiple Reviews)
  const fetchMultipleReviewsForEmployee = async (empId) =>
  {
    try {
      setLoadingMultipleReviews(true)
      // TODO: Replace with actual API endpoint when available
      // For now, using placeholder - adjust based on your actual API
      const response = await API.get(`/EmpAssessments/GetAllreviews/${empId}/${selectedSessionId}`)
      const reviews = response.data || []
      setMultipleReviewsData(reviews)

      // Fetch reviewer names for these reviews
      const reviewerIds = reviews.map(review => review.SubmittedBy).filter(Boolean)
      if (reviewerIds.length > 0) {
        const names = await fetchReviewerNames(reviewerIds)
        setMultipleReviewsReviewerNames(names)
      }
    } catch (error) {
      console.error('Error fetching multiple reviews:', error)
      notify.error('Failed to fetch reviews')
      setMultipleReviewsData([])
    } finally {
      setLoadingMultipleReviews(false)
    }
  }

  // Download Single Reviews Report
  const downloadSingleReviewsReport = async () =>
  {
    try {
      setDownloadingSingleReport(true)
      const response = await API.get(`/EmpAssessments/GetReportForSingleAssessments?sessionID=${selectedSessionId}`, {
        responseType: 'blob'
      })

      // Create blob link and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SingleReviewsReport_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)

      notify.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading single reviews report:', error)
      notify.error('Failed to download report')
    } finally {
      setDownloadingSingleReport(false)
    }
  }

  // Download Multiple Reviews Report
  const downloadMultipleReviewsReport = async () =>
  {
    try {
      setDownloadingMultipleReport(true)
      const response = await API.get(`/EmpAssessments/GetReportForMultipleAssessments?sessionID=${selectedSessionId}`, {
        responseType: 'blob'
      })

      // Create blob link and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `MultipleReviewsReport_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)

      notify.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading multiple reviews report:', error)
      notify.error('Failed to download report')
    } finally {
      setDownloadingMultipleReport(false)
    }
  }

  // Handlers for nested tabs - View Details
  const handleViewDetailsLocal = (review) =>
  {
    setSelectedReviewDetailLocal(review)
  }

  // Handlers for nested tabs - Regularize
  const handleRegularizeLocal = (review) =>
  {
    // Check if reviews are locked
    if (areReviewsLocked) {
      notify.error('Reviews are currently locked and cannot be regularized')
      return
    }

    // Check if user has permission (HR department check)
    if (!showViewAllReviewsTab) {
      notify.error('You do not have permission to regularize reviews')
      return
    }

    // Check if session is selected
    if (!selectedSessionId) {
      notify.error('Please select a session first')
      return
    }

    // Check if current employee is available
    if (!currentEmployee?.EmpID) {
      notify.error('Current employee information is not available')
      return
    }

    // Validate review data
    if (!review || !review.EmpID) {
      notify.error('Invalid review data')
      return
    }

    setSelectedReviewForRegularizationLocal(review)
    setRegularizationFormDataLocal({
      EmpID: review.EmpID,
      SelfDevelopment: review.SelfDevelopment || 0,
      EmployeeStaffDevelopment: review.EmployeeStaffDevelopment || 0,
      DecisionMaking: review.DecisionMaking || 0,
      ProductivityEfficiency: review.ProductivityEfficiency || 0,
      CallForDuty: review.CallForDuty || 0,
      AttendancePunctuality: review.AttendancePunctuality || 0,
      BehaviourOverallDiscipline: review.BehaviourOverallDiscipline || 0,
      Integrity: review.Integrity || 0,
      LoyaltySubmissionToCompanyGoals: review.LoyaltySubmissionToCompanyGoals || 0,
      FinalRemark: review.FinalRemark || ''
    })
  }

  // Handler for regularization form change
  const handleRegularizationFormChangeLocal = (field, value) =>
  {
    // Validate numeric fields in real-time
    if (field !== 'FinalRemark' && field !== 'EmpID') {
      const numericValue = parseInt(value)
      if (value !== '' && (isNaN(numericValue) || numericValue < 0 || numericValue > 4)) {
        notify.error(`${field.replace(/([A-Z])/g, ' $1').trim()} must be between 0 and 4`)
        return
      }
    }

    // Validate Final Remark length
    if (field === 'FinalRemark' && value && value.length > 500) {
      notify.error('Final Remark cannot exceed 500 characters')
      return
    }

    setRegularizationFormDataLocal(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate scores for regularization
  const calculateRegularizationScoresLocal = () =>
  {
    const performanceScore = ((
      parseInt(regularizationFormDataLocal.SelfDevelopment || 0) +
      parseInt(regularizationFormDataLocal.EmployeeStaffDevelopment || 0) +
      parseInt(regularizationFormDataLocal.DecisionMaking || 0) +
      parseInt(regularizationFormDataLocal.ProductivityEfficiency || 0) +
      parseInt(regularizationFormDataLocal.CallForDuty || 0)
    ) / 20) * 100

    const disciplineScore = ((
      parseInt(regularizationFormDataLocal.AttendancePunctuality || 0) +
      parseInt(regularizationFormDataLocal.BehaviourOverallDiscipline || 0)
    ) / 8) * 100

    const integrityScore = ((
      parseInt(regularizationFormDataLocal.Integrity || 0) +
      parseInt(regularizationFormDataLocal.LoyaltySubmissionToCompanyGoals || 0)
    ) / 8) * 100

    const finalPercentage = (performanceScore * 0.6) + (disciplineScore * 0.2) + (integrityScore * 0.2)

    return {
      performanceScore: performanceScore.toFixed(2),
      disciplineScore: disciplineScore.toFixed(2),
      integrityScore: integrityScore.toFixed(2),
      finalPercentage: finalPercentage.toFixed(1)
    }
  }

  // Cancel regularization
  const handleCancelRegularizationLocal = () =>
  {
    setSelectedReviewForRegularizationLocal(null)
    setShowConfirmationDialog(false)
    setRegularizationFormDataLocal({
      SelfDevelopment: 0,
      EmployeeStaffDevelopment: 0,
      DecisionMaking: 0,
      ProductivityEfficiency: 0,
      CallForDuty: 0,
      AttendancePunctuality: 0,
      BehaviourOverallDiscipline: 0,
      Integrity: 0,
      LoyaltySubmissionToCompanyGoals: 0,
      FinalRemark: ''
    })
  }

  // Validate regularization form data
  const validateRegularizationForm = () =>
  {
    const errors = []

    // Validate Employee ID
    if (!regularizationFormDataLocal.EmpID) {
      errors.push('Employee ID is required')
    }

    // Validate Session ID
    if (!selectedSessionId) {
      errors.push('Session is required')
    }

    // Validate Current Employee (Submitter)
    if (!currentEmployee?.EmpID) {
      errors.push('Current employee information is missing')
    }

    // Validate numeric fields (0-4 range)
    const numericFields = [
      { field: 'SelfDevelopment', label: 'Self Development' },
      { field: 'EmployeeStaffDevelopment', label: 'Employee Staff Development' },
      { field: 'DecisionMaking', label: 'Decision Making' },
      { field: 'ProductivityEfficiency', label: 'Productivity Efficiency' },
      { field: 'CallForDuty', label: 'Call For Duty' },
      { field: 'AttendancePunctuality', label: 'Attendance Punctuality' },
      { field: 'BehaviourOverallDiscipline', label: 'Behaviour Overall Discipline' },
      { field: 'Integrity', label: 'Integrity' },
      { field: 'LoyaltySubmissionToCompanyGoals', label: 'Loyalty Submission To Company Goals' }
    ]

    numericFields.forEach(({ field, label }) =>
    {
      const value = parseInt(regularizationFormDataLocal[field])
      if (isNaN(value)) {
        errors.push(`${label} must be a valid number`)
      } else if (value < 0 || value > 4) {
        errors.push(`${label} must be between 0 and 4`)
      }
    })

    // Validate Final Remark (optional but if provided, should not be empty string)
    if (regularizationFormDataLocal.FinalRemark && regularizationFormDataLocal.FinalRemark.trim().length === 0) {
      errors.push('Final Remark cannot be empty if provided')
    }

    return errors
  }

  // Handle confirmation dialog
  const handleConfirmRegularization = () =>
  {
    // Validate form data before showing confirmation
    const validationErrors = validateRegularizationForm()
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => notify.error(error))
      return
    }

    setShowConfirmationDialog(true)
  }

  // Submit regularization
  const handleSubmitRegularizationLocal = async () =>
  {
    try {
      setShowConfirmationDialog(false)
      setIsSubmittingRegularizationLocal(true)

      const scores = calculateRegularizationScoresLocal()
      const currentDate = new Date()

      // Prepare payload with proper data types and validation
      const payload = {
        EAID: 0,
        EmpID: parseInt(regularizationFormDataLocal.EmpID),
        RSID: parseInt(selectedSessionId),
        SelfDevelopment: parseInt(regularizationFormDataLocal.SelfDevelopment),
        EmployeeStaffDevelopment: parseInt(regularizationFormDataLocal.EmployeeStaffDevelopment),
        DecisionMaking: parseInt(regularizationFormDataLocal.DecisionMaking),
        ProductivityEfficiency: parseInt(regularizationFormDataLocal.ProductivityEfficiency),
        CallForDuty: parseInt(regularizationFormDataLocal.CallForDuty),
        PerformanceScore: parseFloat(scores.performanceScore),
        DisciplineScore: parseFloat(scores.disciplineScore),
        IntegrityScore: parseFloat(scores.integrityScore),
        FinalPercentage: parseFloat(scores.finalPercentage),
        Rating: calculateRating(parseFloat(scores.finalPercentage)),
        AttendancePunctuality: parseInt(regularizationFormDataLocal.AttendancePunctuality),
        BehaviourOverallDiscipline: parseInt(regularizationFormDataLocal.BehaviourOverallDiscipline),
        Integrity: parseInt(regularizationFormDataLocal.Integrity),
        LoyaltySubmissionToCompanyGoals: parseInt(regularizationFormDataLocal.LoyaltySubmissionToCompanyGoals),
        FinalRemark: regularizationFormDataLocal.FinalRemark?.trim() || '',
        SubmittedAt: currentDate.toISOString(),
        Month: currentDate.getMonth() + 1,
        Year: currentDate.getFullYear(),
        SubmittedBy: currentEmployee.EmpID
      }

      const response = await API.post('/EmpAssessments', payload)

      notify.success('Review regularized successfully')
      handleCancelRegularizationLocal()

      // Refresh the reviews data for the current tab
      if (activeNestedTab === NESTED_TABS.SINGLE && selectedSingleReviewEmpId) {
        fetchSingleReviewsForEmployee(selectedSingleReviewEmpId)
      } else if (activeNestedTab === NESTED_TABS.MULTIPLE && selectedMultipleReviewEmpId) {
        fetchMultipleReviewsForEmployee(selectedMultipleReviewEmpId)
      }

    } catch (error) {
      console.error('Error submitting regularization:', error)

      // Handle specific API errors
      if (error.response?.status === 400) {
        notify.error('Invalid data provided. Please check all fields.')
      } else if (error.response?.status === 401) {
        notify.error('You are not authorized to perform this action.')
      } else if (error.response?.status === 403) {
        notify.error('Access denied. You do not have permission to regularize reviews.')
      } else if (error.response?.status === 404) {
        notify.error('Employee or session not found.')
      } else if (error.response?.status === 409) {
        notify.error('A conflict occurred. The review may have been modified by another user.')
      } else if (error.response?.status >= 500) {
        notify.error('Server error occurred. Please try again later.')
      } else {
        notify.error('Failed to regularize review. Please try again.')
      }
    } finally {
      setIsSubmittingRegularizationLocal(false)
    }
  }

  // Handle Single Reviews Employee Selection
  const handleSingleReviewEmployeeSelect = useCallback((emp) =>
  {
    setSelectedSingleReviewEmpId(emp.EmpID)
    setSelectedSingleReviewEmployee(emp)
    setSingleReviewEmployeeSearch(`${emp.EmpID} - ${emp.FirstName} ${emp.LastName}`)
    fetchSingleReviewsForEmployee(emp.EmpID)
  }, [])

  // Handle Multiple Reviews Employee Selection
  const handleMultipleReviewEmployeeSelect = useCallback((emp) =>
  {
    setSelectedMultipleReviewEmpId(emp.EmpID)
    setSelectedMultipleReviewEmployee(emp)
    setMultipleReviewEmployeeSearch(`${emp.EmpID} - ${emp.FirstName} ${emp.LastName}`)
    fetchMultipleReviewsForEmployee(emp.EmpID)
  }, [])

  // Handle Single Reviews Employee Search
  const handleSingleReviewEmployeeSearch = useCallback((searchTerm) =>
  {
    setSingleReviewEmployeeSearch(searchTerm)
    if (!searchTerm) {
      setFilteredSingleReviewsEmployees(singleReviewsEmployees)
    } else {
      const filtered = singleReviewsEmployees.filter(emp =>
        emp.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.EmpID?.toString().includes(searchTerm) ||
        emp.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSingleReviewsEmployees(filtered)
    }
  }, [singleReviewsEmployees])

  // Handle Multiple Reviews Employee Search
  const handleMultipleReviewEmployeeSearch = useCallback((searchTerm) =>
  {
    setMultipleReviewEmployeeSearch(searchTerm)
    if (!searchTerm) {
      setFilteredMultipleReviewsEmployees(multipleReviewsEmployees)
    } else {
      const filtered = multipleReviewsEmployees.filter(emp =>
        emp.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.EmpID?.toString().includes(searchTerm) ||
        emp.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMultipleReviewsEmployees(filtered)
    }
  }, [multipleReviewsEmployees])

  // Load data when tab changes or session changes
  useEffect(() =>
  {
    if (activeNestedTab === NESTED_TABS.SINGLE && singleReviewsEmployees.length === 0) {
      fetchSingleReviewsEmployees()
    }
  }, [activeNestedTab, selectedSessionId])

  useEffect(() =>
  {
    if (activeNestedTab === NESTED_TABS.MULTIPLE && multipleReviewsEmployees.length === 0) {
      fetchMultipleReviewsEmployees()
    }
  }, [activeNestedTab, selectedSessionId])

  // Reset modals and data when tab changes
  useEffect(() =>
  {
    // Close all modals and reset form data
    setSelectedReviewDetailLocal(null)
    setSelectedReviewForRegularizationLocal(null)
    setRegularizationFormDataLocal({
      SelfDevelopment: 0,
      EmployeeStaffDevelopment: 0,
      DecisionMaking: 0,
      ProductivityEfficiency: 0,
      CallForDuty: 0,
      AttendancePunctuality: 0,
      BehaviourOverallDiscipline: 0,
      Integrity: 0,
      LoyaltySubmissionToCompanyGoals: 0,
      FinalRemark: ''
    })
    setIsSubmittingRegularizationLocal(false)
  }, [activeNestedTab])

  // Check if HR department (same logic as original)
  if (!showViewAllReviewsTab) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Unauthorized Access
          </h4>
          <p className="text-gray-500 max-w-md mx-auto">
            This feature is only available for HR department.
          </p>
        </div>
      </div>
    )
  }

  // Common ReviewsTable Component (reusable)
  const ReviewsTable = ({ reviews, isLoading, selectedEmpId, onViewDetails, onRegularize, selectedDetail, reviewerNamesData = {} }) =>
  {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!selectedEmpId) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Select an employee to view their reviews</p>
        </div>
      )
    }

    if (selectedEmpId && reviews.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No reviews found for this employee</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month/Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discipline
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Integrity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr
                key={review.EAID}
                className={`hover:bg-gray-50 transition-colors ${selectedDetail?.EAID === review.EAID ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                  {new Date(review.SubmittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {review.Month}/{review.Year}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {reviewerNamesData[review.SubmittedBy] || reviewerNames[review.SubmittedBy] || 'Loading...'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                    {review.PerformanceScore}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-medium">
                    {review.DisciplineScore}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                    {review.IntegrityScore}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-bold">
                    {review.FinalPercentage}%
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(review)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                    {!areReviewsLocked && (
                      <button
                        onClick={() => onRegularize(review)}
                        className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Regularize"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      {/* Nested Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { id: NESTED_TABS.SINGLE, label: 'Single Reviews', icon: '👤' },
            { id: NESTED_TABS.MULTIPLE, label: 'Multiple Reviews', icon: '👥' },
            { id: NESTED_TABS.ALL, label: 'View All Reviews', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveNestedTab(tab.id)}
              className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeNestedTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Single Reviews Tab */}
        {activeNestedTab === NESTED_TABS.SINGLE && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${selectedReviewDetailLocal ? '' : ''}`}
          >
            <div className={`${selectedReviewDetailLocal ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Single Reviews</h2>
                </div>
                <button
                  onClick={downloadSingleReviewsReport}
                  disabled={downloadingSingleReport || !selectedSessionId}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {downloadingSingleReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Report
                    </>
                  )}
                </button>
              </div>

              <EmployeeSearchDropdown
                search={singleReviewEmployeeSearch}
                onSearchChange={handleSingleReviewEmployeeSearch}
                onSelect={handleSingleReviewEmployeeSelect}
                filteredEmployees={filteredSingleReviewsEmployees}
                showDropdown={showSingleReviewEmployeeDropdown}
                setShowDropdown={setShowSingleReviewEmployeeDropdown}
                selectedEmpId={selectedSingleReviewEmpId}
                dropdownRef={singleReviewDropdownRef}
                inputRef={singleReviewInputRef}
                onClear={handleClearSingleReview}
              />

              <ReviewsTable
                reviews={singleReviewsData}
                isLoading={loadingSingleReviews}
                selectedEmpId={selectedSingleReviewEmpId}
                onViewDetails={handleViewDetailsLocal}
                onRegularize={handleRegularizeLocal}
                selectedDetail={selectedReviewDetailLocal}
                reviewerNamesData={singleReviewsReviewerNames}
              />

              {/* Regularization Form for Single Reviews */}
              {selectedReviewForRegularizationLocal && !areReviewsLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <RegularizationModal
                    selectedReviewEmpId={selectedReviewForRegularizationLocal.EmpID}
                    formData={regularizationFormDataLocal}
                    isSubmitting={isSubmittingRegularizationLocal}
                    onFormChange={handleRegularizationFormChangeLocal}
                    onSubmit={handleConfirmRegularization}
                    onCancel={handleCancelRegularizationLocal}
                    calculateScores={calculateRegularizationScoresLocal}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column - Review Detail Modal for Single Reviews */}
            {selectedReviewDetailLocal && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <ReviewDetailModal
                  review={selectedReviewDetailLocal}
                  onClose={() => setSelectedReviewDetailLocal(null)}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Multiple Reviews Tab */}
        {activeNestedTab === NESTED_TABS.MULTIPLE && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${selectedReviewDetailLocal ? '' : ''}`}
          >
            <div className={`${selectedReviewDetailLocal ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Multiple Reviews</h2>
                </div>
                <button
                  onClick={downloadMultipleReviewsReport}
                  disabled={downloadingMultipleReport || !selectedSessionId}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {downloadingMultipleReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Report
                    </>
                  )}
                </button>
              </div>

              <EmployeeSearchDropdown
                search={multipleReviewEmployeeSearch}
                onSearchChange={handleMultipleReviewEmployeeSearch}
                onSelect={handleMultipleReviewEmployeeSelect}
                filteredEmployees={filteredMultipleReviewsEmployees}
                showDropdown={showMultipleReviewEmployeeDropdown}
                setShowDropdown={setShowMultipleReviewEmployeeDropdown}
                selectedEmpId={selectedMultipleReviewEmpId}
                dropdownRef={multipleReviewDropdownRef}
                inputRef={multipleReviewInputRef}
                onClear={handleClearMultipleReview}
              />

              <ReviewsTable
                reviews={multipleReviewsData}
                isLoading={loadingMultipleReviews}
                selectedEmpId={selectedMultipleReviewEmpId}
                onViewDetails={handleViewDetailsLocal}
                onRegularize={handleRegularizeLocal}
                selectedDetail={selectedReviewDetailLocal}
                reviewerNamesData={multipleReviewsReviewerNames}
              />

              {/* Regularization Form for Multiple Reviews */}
              {selectedReviewForRegularizationLocal && !areReviewsLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <RegularizationModal
                    selectedReviewEmpId={selectedReviewForRegularizationLocal.EmpID}
                    formData={regularizationFormDataLocal}
                    isSubmitting={isSubmittingRegularizationLocal}
                    onFormChange={handleRegularizationFormChangeLocal}
                    onSubmit={handleConfirmRegularization}
                    onCancel={handleCancelRegularizationLocal}
                    calculateScores={calculateRegularizationScoresLocal}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column - Review Detail Modal for Multiple Reviews */}
            {selectedReviewDetailLocal && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <ReviewDetailModal
                  review={selectedReviewDetailLocal}
                  onClose={() => setSelectedReviewDetailLocal(null)}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* View All Reviews Tab - Now using same components as Single & Multiple */}
        {activeNestedTab === NESTED_TABS.ALL && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${selectedReviewDetailLocal ? '' : ''}`}
          >
            <div className={`${selectedReviewDetailLocal ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">View All Reviews</h2>
                </div>
              </div>

              <EmployeeSearchDropdown
                search={reviewEmployeeSearch}
                onSearchChange={handleReviewEmployeeSearchChange}
                onSelect={handleReviewEmployeeSelect}
                filteredEmployees={filteredAllReviewsEmployees}
                showDropdown={showReviewEmployeeDropdown}
                setShowDropdown={setShowReviewEmployeeDropdown}
                selectedEmpId={selectedReviewEmpId}
                dropdownRef={reviewEmployeeDropdownRef}
                inputRef={reviewEmployeeInputRef}
                onClear={handleClearSelection}
              />

              <ReviewsTable
                reviews={allEmployeeReviews}
                isLoading={loadingAllReviews}
                selectedEmpId={selectedReviewEmpId}
                onViewDetails={handleViewDetailsLocal}
                onRegularize={handleRegularizeLocal}
                selectedDetail={selectedReviewDetailLocal}
                reviewerNamesData={{}}
              />

              {/* Regularization Form for View All Reviews */}
              {selectedReviewForRegularizationLocal && !areReviewsLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <RegularizationModal
                    selectedReviewEmpId={selectedReviewForRegularizationLocal.EmpID}
                    formData={regularizationFormDataLocal}
                    isSubmitting={isSubmittingRegularizationLocal}
                    onFormChange={handleRegularizationFormChangeLocal}
                    onSubmit={handleConfirmRegularization}
                    onCancel={handleCancelRegularizationLocal}
                    calculateScores={calculateRegularizationScoresLocal}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column - Review Detail Modal for View All Reviews */}
            {selectedReviewDetailLocal && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <ReviewDetailModal
                  review={selectedReviewDetailLocal}
                  onClose={() => setSelectedReviewDetailLocal(null)}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmationDialog && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Regularization
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to regularize this review? This action will update the employee's assessment scores and cannot be easily undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmationDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRegularizationLocal}
                disabled={isSubmittingRegularizationLocal}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isSubmittingRegularizationLocal
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {isSubmittingRegularizationLocal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Confirm Regularization
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ViewAllReviewsTab