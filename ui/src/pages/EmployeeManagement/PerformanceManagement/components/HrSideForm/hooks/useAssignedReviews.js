/**
 * useAssignedReviews Hook
 * 
 * Manages assigned reviews functionality including:
 * - Loading employees assigned to current user as assessor
 * - Employee search and selection
 * - Checking if user has assigned reviews
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { API, notification } from '@/services'
import { getParameterValueFromReview } from '../utils/calculationHelpers'

export const useAssignedReviews = (currentEmployee, selectedSessionId, reviewParameters = []) => {
  const notify = notification()

  // State management
  const [showReviewAssignedTab, setShowReviewAssignedTab] = useState(false)
  const [assignedEmployees, setAssignedEmployees] = useState([])
  const [filteredAssignedEmployees, setFilteredAssignedEmployees] = useState([])
  const [selectedAssignedEmpId, setSelectedAssignedEmpId] = useState('')
  const [assignedEmployeeSearch, setAssignedEmployeeSearch] = useState('')
  const [showAssignedEmployeeDropdown, setShowAssignedEmployeeDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Assessment data management
  const [assessmentData, setAssessmentData] = useState({})
  const [finalRemarks, setFinalRemarks] = useState({})
  
  // Track original data for change detection
  const [originalAssessmentData, setOriginalAssessmentData] = useState({})
  const [originalFinalRemarks, setOriginalFinalRemarks] = useState({})
  
  // Filter management
  const [assignedFilter, setAssignedFilter] = useState(null) // null = all, 'assessed' = completed, 'remaining' = pending

  // Refs
  const assignedEmployeeDropdownRef = useRef(null)
  const assignedEmployeeInputRef = useRef(null)

  // Check if current employee is assigned as an assessor
  useEffect(() => {
    const checkAssessorAssignments = async () => {
      console.log('Checking assessor assignments for:', currentEmployee?.EmpID, 'Session:', selectedSessionId)

      if (!currentEmployee?.EmpID || !selectedSessionId) {
        setShowReviewAssignedTab(false)
        setAssignedEmployees([])
        setFilteredAssignedEmployees([])
        return
      }

      setIsLoading(true)

      try {
        // Check if user is assigned as an assessor for the selected session
        const response = await API.get(
          `/RandomAssessments/GetEmployeebyAssessorID?id=${currentEmployee.EmpID}&sessionID=${selectedSessionId}`
        )

        if (response.data) {
          const assignment = response.data
          console.log('Assignment data:', assignment)

          // Get the list of assessee IDs from the assignment
          const assesseeIds = assignment.AssesseeIDs || []
          console.log('Assessee IDs:', assesseeIds)

          if (assesseeIds.length > 0) {
            // Load all employees to filter assigned ones
            const allEmpsResponse = await API.get('/Employees')
            const allEmpsList = Array.isArray(allEmpsResponse.data) ? allEmpsResponse.data : []

            // Filter employees whose IDs are in the assesseeIds array
            const assignedEmps = allEmpsList.filter(emp => assesseeIds.includes(emp.EmpID))

            console.log('Assigned employees:', assignedEmps)

            setAssignedEmployees(assignedEmps)
            setFilteredAssignedEmployees(assignedEmps)
            setShowReviewAssignedTab(true)
          } else {
            setShowReviewAssignedTab(false)
            setAssignedEmployees([])
            setFilteredAssignedEmployees([])
          }
        } else {
          setShowReviewAssignedTab(false)
          setAssignedEmployees([])
          setFilteredAssignedEmployees([])
        }
      } catch (err) {
        console.error('Failed to check assessor assignments', err)
        setShowReviewAssignedTab(false)
        setAssignedEmployees([])
        setFilteredAssignedEmployees([])
      } finally {
        setIsLoading(false)
      }
    }

    checkAssessorAssignments()
  }, [currentEmployee?.EmpID, selectedSessionId])



  // Check if employee is assessed (based on original data)
  const isEmployeeAssessed = (empId) => {
    if (!reviewParameters || reviewParameters.length === 0) return false
    
    return reviewParameters.some(param => {
      const key = `${empId}_${param.ReviewParameterID}`
      return originalAssessmentData[key] && originalAssessmentData[key] > 0
    })
  }

  // Filter assigned employees based on search and assessment status
  useEffect(() => {
    let filtered = assignedEmployees

    // Apply assessment status filter first
    if (assignedFilter === 'assessed') {
      filtered = filtered.filter(emp => isEmployeeAssessed(emp.EmpID))
    } else if (assignedFilter === 'remaining') {
      filtered = filtered.filter(emp => !isEmployeeAssessed(emp.EmpID))
    }

    // Apply search filter
    if (assignedEmployeeSearch.trim()) {
      const searchLower = assignedEmployeeSearch.toLowerCase()
      filtered = filtered.filter(emp => {
        const fullName = `${emp.FirstName || ''} ${emp.LastName || ''}`.toLowerCase().trim()
        const empId = emp.EmpID?.toString().toLowerCase() || ''
        const email = emp.WorkEmail?.toLowerCase() || emp.Email?.toLowerCase() || ''
        const empNo = emp.EmpNo?.toString().toLowerCase() || ''
        
        return fullName.includes(searchLower) || 
               empId.includes(searchLower) || 
               email.includes(searchLower) ||
               empNo.includes(searchLower)
      })
    }
    
    setFilteredAssignedEmployees(filtered)
  }, [assignedEmployeeSearch, assignedEmployees, assignedFilter, originalAssessmentData, reviewParameters])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assignedEmployeeDropdownRef.current && 
          !assignedEmployeeDropdownRef.current.contains(event.target)) {
        setShowAssignedEmployeeDropdown(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAssignedEmployeeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Handle assigned employee selection
  const handleAssignedEmployeeSelect = (employee) => {
    setSelectedAssignedEmpId(employee.EmpID.toString())
    setAssignedEmployeeSearch(`${employee.EmpID} - ${employee.FirstName} ${employee.LastName}`)
    setShowAssignedEmployeeDropdown(false)
    
    // Remove focus from input field
    if (assignedEmployeeInputRef.current) {
      assignedEmployeeInputRef.current.blur()
    }
  }

  // Handle search change
  const handleAssignedEmployeeSearchChange = (value) => {
    setAssignedEmployeeSearch(value)
    setShowAssignedEmployeeDropdown(true)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedAssignedEmpId('')
    setAssignedEmployeeSearch('')
    setShowAssignedEmployeeDropdown(false)
  }

  // Load existing reviews for assigned employees
  const loadExistingReviews = useCallback(async () => {
    if (!currentEmployee?.EmpID || !selectedSessionId || reviewParameters.length === 0 || assignedEmployees.length === 0) {
      return
    }

    try {
      console.log('Loading existing reviews for assigned employees...')
      const response = await API.get(`/EmpAssessments/GetReviewsbyReviewerID/${currentEmployee.EmpID}/${selectedSessionId}`)
      const existingReviews = Array.isArray(response.data) ? response.data : []

      console.log('Existing reviews found:', existingReviews)

      // Filter reviews for assigned employees only
      const assignedEmpIds = assignedEmployees.map(emp => emp.EmpID)
      const assignedReviews = existingReviews.filter(review => assignedEmpIds.includes(review.EmpID))

      console.log('Assigned employee reviews:', assignedReviews)

      // Populate assessment data with existing reviews
      const newAssessmentData = {}
      const newFinalRemarks = {}
      
      assignedReviews.forEach(review => {
        reviewParameters.forEach(param => {
          const key = `${review.EmpID}_${param.ReviewParameterID}`
          // Map the review data to parameter values based on parameter names
          newAssessmentData[key] = getParameterValueFromReview(review, param)
        })
        
        // Store final remarks
        if (review.FinalRemark) {
          newFinalRemarks[review.EmpID] = review.FinalRemark
        }
      })

      console.log('Populated assessment data:', newAssessmentData)
      console.log('Populated final remarks:', newFinalRemarks)

      setAssessmentData(newAssessmentData)
      setFinalRemarks(newFinalRemarks)
      
      // Store original data for change tracking
      setOriginalAssessmentData({ ...newAssessmentData })
      setOriginalFinalRemarks({ ...newFinalRemarks })
    } catch (error) {
      console.error('Failed to load existing assigned reviews:', error)
    }
  }, [currentEmployee?.EmpID, selectedSessionId, reviewParameters, assignedEmployees])

  // Load existing reviews when assigned employees or review parameters change
  useEffect(() => {
    if (assignedEmployees.length > 0 && reviewParameters.length > 0) {
      loadExistingReviews()
    }
  }, [assignedEmployees, reviewParameters, loadExistingReviews])

  // Load assigned employees (for external calls)
  const loadAssignedEmployees = async () => {
    if (!currentEmployee?.EmpID || !selectedSessionId) return

    setIsLoading(true)
    try {
      const response = await API.get(
        `/RandomAssessments/GetEmployeebyAssessorID?id=${currentEmployee.EmpID}&sessionID=${selectedSessionId}`
      )

      if (response.data) {
        const assignment = response.data
        const assesseeIds = assignment.AssesseeIDs || []

        if (assesseeIds.length > 0) {
          const allEmpsResponse = await API.get('/Employees')
          const allEmpsList = Array.isArray(allEmpsResponse.data) ? allEmpsResponse.data : []
          const assignedEmps = allEmpsList.filter(emp => assesseeIds.includes(emp.EmpID))

          setAssignedEmployees(assignedEmps)
          setFilteredAssignedEmployees(assignedEmps)
          
          // Load existing reviews after employees are loaded
          if (reviewParameters.length > 0) {
            // Use setTimeout to ensure state is updated before loading reviews
            setTimeout(() => {
              loadExistingReviews()
            }, 100)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load assigned employees', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle assessment data changes
  const handleAssessmentChange = (empId, parameterId, value) => {
    const key = `${empId}_${parameterId}`
    setAssessmentData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }))
  }

  // Handle final remarks changes
  const handleFinalRemarkChange = (empId, value) => {
    setFinalRemarks(prev => ({
      ...prev,
      [empId]: value
    }))
  }

  // Handle search change for dropdown
  const onSearchChange = (value) => {
    setAssignedEmployeeSearch(value)
    // Keep dropdown open when searching
    if (value && !showAssignedEmployeeDropdown) {
      setShowAssignedEmployeeDropdown(true)
    }
  }

  // Handle dropdown toggle
  const onDropdownToggle = () => {
    setShowAssignedEmployeeDropdown(!showAssignedEmployeeDropdown)
  }

  // Handle filter change (toggle behavior)
  const handleFilterChange = (filterType) => {
    setAssignedFilter(prev => prev === filterType ? null : filterType)
  }

  // Calculate assessment stats (based on original data)
  const getAssignedReviewStats = () => {
    const totalEmployees = assignedEmployees.length
    const assessedEmployees = assignedEmployees.filter(emp => isEmployeeAssessed(emp.EmpID)).length
    const remainingEmployees = totalEmployees - assessedEmployees

    return {
      TotalEmployees: totalEmployees,
      Completed: assessedEmployees,
      Remaining: remainingEmployees
    }
  }

  // Check if employee data has changed
  const hasEmployeeDataChanged = useCallback((empId) => {
    // Check if any assessment parameter has changed
    const assessmentChanged = reviewParameters.some(param => {
      const key = `${empId}_${param.ReviewParameterID}`
      const currentValue = assessmentData[key] || 0
      const originalValue = originalAssessmentData[key] || 0
      return currentValue !== originalValue
    })

    // Check if final remarks have changed
    const currentRemark = finalRemarks[empId] || ''
    const originalRemark = originalFinalRemarks[empId] || ''
    const remarksChanged = currentRemark !== originalRemark

    return assessmentChanged || remarksChanged
  }, [assessmentData, originalAssessmentData, finalRemarks, originalFinalRemarks, reviewParameters])

  // Get only changed employees for submission
  const getChangedEmployees = useCallback(() => {
    return assignedEmployees.filter(employee => {
      const empId = employee.EmpID
      
      // Check if employee has any current data (new or modified)
      const hasCurrentData = reviewParameters.some(param => {
        const key = `${empId}_${param.ReviewParameterID}`
        return assessmentData[key] > 0
      }) || (finalRemarks[empId] && finalRemarks[empId].trim() !== '')

      // Only include if has current data AND has changed from original
      return hasCurrentData && hasEmployeeDataChanged(empId)
    })
  }, [assignedEmployees, reviewParameters, assessmentData, finalRemarks, hasEmployeeDataChanged])

  // Check if has assigned reviews
  const hasAssignedReviews = assignedEmployees.length > 0

  return {
    // State
    showReviewAssignedTab,
    assignedEmployees,
    filteredAssignedEmployees,
    selectedAssignedEmpId,
    assignedEmployeeSearch,
    showAssignedEmployeeDropdown,
    isLoading,
    hasAssignedReviews,

    // Assessment data
    assessmentData,
    finalRemarks,

    // Refs
    assignedEmployeeDropdownRef,
    assignedEmployeeInputRef,
    dropdownRef: assignedEmployeeDropdownRef,
    searchValue: assignedEmployeeSearch,
    showDropdown: showAssignedEmployeeDropdown,

    // Setters
    setShowAssignedEmployeeDropdown,

    // Filter state and handlers
    assignedFilter,
    assignedReviewStats: getAssignedReviewStats(),
    handleFilterChange,

    // Actions
    handleAssignedEmployeeSelect,
    handleAssignedEmployeeSearchChange,
    clearSelection,
    loadAssignedEmployees,
    loadExistingReviews,
    onAssessmentChange: handleAssessmentChange,
    onFinalRemarkChange: handleFinalRemarkChange,
    onSearchChange,
    onDropdownToggle,
    
    // Change tracking
    hasEmployeeDataChanged,
    getChangedEmployees,
    originalAssessmentData,
    originalFinalRemarks
  }
}

export default useAssignedReviews