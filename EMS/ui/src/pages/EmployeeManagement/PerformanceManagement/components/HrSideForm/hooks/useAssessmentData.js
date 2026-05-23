import { useState, useCallback, useEffect } from 'react'
import { API, notification } from '@/services'
import useEmpDataStore from '@/store/empDataStore'
import { getParameterValueFromReview } from '../utils/calculationHelpers'

/**
 * Custom hook to manage assessment data and final remarks
 */
export const useAssessmentData = (selectedSessionId, reviewParameters, overallFilter) => {
  const notify = notification()
  const { currentEmployee } = useEmpDataStore()
  const [employees, setEmployees] = useState([])
  const [assessmentData, setAssessmentData] = useState({})
  const [finalRemarks, setFinalRemarks] = useState({})
  
  // Track original data for change detection
  const [originalAssessmentData, setOriginalAssessmentData] = useState({})
  const [originalFinalRemarks, setOriginalFinalRemarks] = useState({})
  
  // Filter state for AssessmentTab
  const [assessmentFilter, setAssessmentFilter] = useState(null) // null = all, 'assessed' = completed, 'remaining' = pending

  // Load existing reviews for selected session
  const loadExistingReviews = useCallback(async (currentEmployee, sessionId) => {
    if (!currentEmployee?.EmpID || !sessionId || reviewParameters.length === 0) return

    try {
      const response = await API.get(`/EmpAssessments/GetReviewsbyReviewerID/${currentEmployee.EmpID}/${sessionId}`)
      const existingReviews = Array.isArray(response.data) ? response.data : []

      // Populate assessment data with existing reviews
      const newAssessmentData = {}
      const newFinalRemarks = {}
      
      existingReviews.forEach(review => {
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

      setAssessmentData(newAssessmentData)
      setFinalRemarks(newFinalRemarks)
      
      // Store original data for change tracking
      setOriginalAssessmentData({ ...newAssessmentData })
      setOriginalFinalRemarks({ ...newFinalRemarks })
    } catch (error) {
      console.error('Failed to load existing reviews:', error)
      // notify.error('Failed to load existing reviews')
    }
  }, [reviewParameters])

  // Handle assessment value change
  const handleAssessmentChange = useCallback((empId, parameterId, value) => {
    const key = `${empId}_${parameterId}`
    setAssessmentData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }))
  }, [])

  // Handle final remark change
  const handleFinalRemarkChange = useCallback((empId, remark) => {
    console.log('Final remark changed for employee:', empId, 'Remark:', remark)
    setFinalRemarks(prev => {
      const updated = {
        ...prev,
        [empId]: remark
      }
      console.log('Updated finalRemarks state:', updated)
      return updated
    })
  }, [])

  // Load employees by manager
  const loadEmployeesByManager = useCallback(async () => {
    if (!currentEmployee?.EmpID) {
      console.log('No current employee found')
      return
    }

    try {
      console.log('Loading employees for manager:', currentEmployee.EmpID)
      const response = await API.get(`/Employees/GetEmployeebymanager?EmpID=${currentEmployee.EmpID}`)
      const employeeList = Array.isArray(response.data) ? response.data : []
      console.log('Loaded employees:', employeeList)
      setEmployees(employeeList)
    } catch (err) {
      console.error('Failed to load employees by manager', err)
    }
  }, [currentEmployee?.EmpID])

  // Load assessments (combines loading employees and existing reviews)
  const loadAssessments = useCallback(async () => {
    await loadEmployeesByManager()
    if (selectedSessionId && reviewParameters.length > 0) {
      await loadExistingReviews(currentEmployee, selectedSessionId)
    }
  }, [loadEmployeesByManager, loadExistingReviews, selectedSessionId, reviewParameters, currentEmployee])

  // Filter employees based on assessment status (using original data)
  const getFilteredEmployees = useCallback((filterType) => {
    if (!filterType) return employees
    
    return employees.filter(emp => {
      const isAssessed = reviewParameters.some(param => {
        const key = `${emp.EmpID}_${param.ReviewParameterID}`
        return originalAssessmentData[key] && originalAssessmentData[key] > 0
      })
      if (filterType === 'assessed') return isAssessed
      if (filterType === 'remaining') return !isAssessed
      return true
    })
  }, [employees, reviewParameters, originalAssessmentData])

  // Handle filter change for AssessmentTab (toggle behavior)
  const handleAssessmentFilterChange = useCallback((filterType) => {
    setAssessmentFilter(prev => prev === filterType ? null : filterType)
  }, [])

  // Calculate assessment stats for AssessmentTab (based on original data)
  const getAssessmentStats = useCallback(() => {
    const totalEmployees = employees.length
    const assessedEmployees = employees.filter(emp => {
      return reviewParameters.some(param => {
        const key = `${emp.EmpID}_${param.ReviewParameterID}`
        return originalAssessmentData[key] && originalAssessmentData[key] > 0
      })
    }).length
    const remainingEmployees = totalEmployees - assessedEmployees

    return {
      TotalEmployees: totalEmployees,
      Completed: assessedEmployees,
      Remaining: remainingEmployees
    }
  }, [employees, reviewParameters, originalAssessmentData])

  // Get filtered employees for AssessmentTab (based on original data to prevent disappearing during editing)
  const getAssessmentFilteredEmployees = useCallback(() => {
    let filtered = employees
    
    // Use assessmentFilter if set, otherwise fall back to overallFilter for backward compatibility
    const activeFilter = assessmentFilter !== null ? assessmentFilter : overallFilter
    
    if (activeFilter === 'assessed') {
      filtered = filtered.filter(emp => {
        return reviewParameters.some(param => {
          const key = `${emp.EmpID}_${param.ReviewParameterID}`
          return originalAssessmentData[key] && originalAssessmentData[key] > 0
        })
      })
    } else if (activeFilter === 'remaining') {
      filtered = filtered.filter(emp => {
        return !reviewParameters.some(param => {
          const key = `${emp.EmpID}_${param.ReviewParameterID}`
          return originalAssessmentData[key] && originalAssessmentData[key] > 0
        })
      })
    }
    
    return filtered
  }, [employees, reviewParameters, originalAssessmentData, assessmentFilter, overallFilter])

  // Handle filter change (legacy function for backward compatibility)
  const handleFilterChange = useCallback((filterType) => {
    // This will be handled by the component using this hook
    return getFilteredEmployees(filterType)
  }, [getFilteredEmployees])

  // Reset assessment data
  const resetAssessmentData = useCallback(() => {
    setAssessmentData({})
    setFinalRemarks({})
    setOriginalAssessmentData({})
    setOriginalFinalRemarks({})
  }, [])

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
    return employees.filter(employee => {
      const empId = employee.EmpID
      
      // Check if employee has any current data (new or modified)
      const hasCurrentData = reviewParameters.some(param => {
        const key = `${empId}_${param.ReviewParameterID}`
        return assessmentData[key] > 0
      }) || (finalRemarks[empId] && finalRemarks[empId].trim() !== '')

      // Only include if has current data AND has changed from original
      return hasCurrentData && hasEmployeeDataChanged(empId)
    })
  }, [employees, reviewParameters, assessmentData, finalRemarks, hasEmployeeDataChanged])

  // Load employees on mount and when currentEmployee changes
  useEffect(() => {
    loadEmployeesByManager()
  }, [loadEmployeesByManager])

  // Load existing reviews when session or parameters change
  useEffect(() => {
    if (selectedSessionId && reviewParameters.length > 0) {
      loadExistingReviews(currentEmployee, selectedSessionId)
    }
  }, [selectedSessionId, reviewParameters, currentEmployee, loadExistingReviews])

  return {
    employees,
    filteredEmployees: getFilteredEmployees(overallFilter), // Legacy for backward compatibility
    assessmentFilteredEmployees: getAssessmentFilteredEmployees(), // New filtered employees for AssessmentTab
    assessmentData,
    finalRemarks,
    
    // Filter state and handlers for AssessmentTab
    assessmentFilter,
    assessmentStats: getAssessmentStats(),
    handleAssessmentFilterChange,
    
    // Legacy functions
    loadExistingReviews,
    loadAssessments,
    handleAssessmentChange,
    handleFinalRemarkChange,
    handleFilterChange,
    resetAssessmentData,
    setAssessmentData,
    setFinalRemarks,
    
    // Change tracking
    hasEmployeeDataChanged,
    getChangedEmployees,
    originalAssessmentData,
    originalFinalRemarks
  }
}

export default useAssessmentData