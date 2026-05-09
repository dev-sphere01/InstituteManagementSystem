/**
 * useViewAllReviews Hook
 * 
 * Manages view all reviews functionality including:
 * - Loading all employees for HR department
 * - Employee search and selection
 * - Fetching all reviews for selected employee
 * - Loading reviewer names
 * - Review detail management
 */

import { useState, useEffect, useRef } from 'react'
import { API, notification } from '@/services'

export const useViewAllReviews = (currentEmployee, selectedSessionId) => {
  const notify = notification()

  // State management
  const [showViewAllReviewsTab, setShowViewAllReviewsTab] = useState(false)
  const [isHRDepartment, setIsHRDepartment] = useState(false)
  const [allReviewsEmployees, setAllReviewsEmployees] = useState([])
  const [filteredAllReviewsEmployees, setFilteredAllReviewsEmployees] = useState([])
  const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null)
  const [selectedReviewEmpId, setSelectedReviewEmpId] = useState('')
  const [reviewEmployeeSearch, setReviewEmployeeSearch] = useState('')
  const [showReviewEmployeeDropdown, setShowReviewEmployeeDropdown] = useState(false)
  const [allEmployeeReviews, setAllEmployeeReviews] = useState([])
  const [loadingAllReviews, setLoadingAllReviews] = useState(false)
  const [selectedReviewDetail, setSelectedReviewDetail] = useState(null)
  const [reviewerNames, setReviewerNames] = useState({})

  // Regularization states
  const [selectedReviewForRegularization, setSelectedReviewForRegularization] = useState(null)
  const [regularizationFormData, setRegularizationFormData] = useState({
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
  const [isSubmittingRegularization, setIsSubmittingRegularization] = useState(false)

  // Refs
  const reviewEmployeeDropdownRef = useRef(null)
  const reviewEmployeeInputRef = useRef(null)

  // Check if user is in HR department and load all employees
  useEffect(() => {
    const checkDeptAndLoadEmployees = async () => {
      if (!currentEmployee?.EmpID) {
        setShowViewAllReviewsTab(false)
        setIsHRDepartment(false)
        return
      }

      try {
        // Check employee's department
        const deptResponse = await API.get(`/EmpDeptPos/${currentEmployee.EmpID}`)
        
        // Debug: Log department check
        console.log('Department check for ViewAllReviews:', {
          empId: currentEmployee.EmpID,
          deptResponse: deptResponse.data,
          deptId: deptResponse.data?.DeptID,
          isHR: deptResponse.data?.DeptID === 10,
          willShowTabs: deptResponse.data?.DeptID === 10
        })
        
        if (deptResponse.data && deptResponse.data.DeptID === 10) {
          console.log('✅ HR Department detected - enabling ViewAllReviews and RandomAssessment tabs')
          setShowViewAllReviewsTab(true)
          setIsHRDepartment(true)

          // Load all employees for view all reviews
          const allEmpsResponse = await API.get(`/Employees/ForHR/${currentEmployee.EmpID}`)
          const allEmpsList = Array.isArray(allEmpsResponse.data) ? allEmpsResponse.data : []
          
          console.log('Loaded employees for HR:', allEmpsList.length)
          setAllReviewsEmployees(allEmpsList)
          setFilteredAllReviewsEmployees(allEmpsList)
        } else {
          console.log('❌ Not HR Department - disabling ViewAllReviews and RandomAssessment tabs')
          setShowViewAllReviewsTab(false)
          setIsHRDepartment(false)
        }
      } catch (err) {
        console.error('Failed to check department or load employees', err)
        setShowViewAllReviewsTab(false)
        setIsHRDepartment(false)
      }
    }

    checkDeptAndLoadEmployees()
  }, [currentEmployee?.EmpID])

  // Filter review employees based on search
  useEffect(() => {
    if (!reviewEmployeeSearch.trim()) {
      setFilteredAllReviewsEmployees(allReviewsEmployees)
      return
    }

    const searchLower = reviewEmployeeSearch.toLowerCase()
    const filtered = allReviewsEmployees.filter(emp => {
      const fullName = `${emp.FirstName} ${emp.LastName}`.toLowerCase()
      const empId = emp.EmpID?.toString().toLowerCase() || ''
      const email = emp.Email?.toLowerCase() || emp.WorkEmail?.toLowerCase() || ''
      
      return fullName.includes(searchLower) || 
             empId.includes(searchLower) || 
             email.includes(searchLower)
    })
    
    setFilteredAllReviewsEmployees(filtered)
  }, [reviewEmployeeSearch, allReviewsEmployees])

  // Fetch all reviews for selected employee
  useEffect(() => {
    const fetchAllEmployeeReviews = async () => {
      if (!selectedReviewEmpId || !selectedSessionId) {
        setAllEmployeeReviews([])
        setSelectedReviewDetail(null)
        setReviewerNames({})
        return
      }

      setLoadingAllReviews(true)

      try {
        const response = await API.get(
          `/EmpAssessments/GetAllreviews/${selectedReviewEmpId}/${selectedSessionId}`
        )
        
        if (response.data && Array.isArray(response.data)) {
          setAllEmployeeReviews(response.data)

          // Fetch reviewer names for all unique SubmittedBy IDs
          const uniqueReviewerIds = [
            ...new Set(response.data.map(review => review.SubmittedBy).filter(id => id))
          ]
          const reviewerNamesMap = {}

          await Promise.all(
            uniqueReviewerIds.map(async (empId) => {
              try {
                const empResponse = await API.get(`/Employees/${empId}`)
                if (empResponse.data) {
                  reviewerNamesMap[empId] = `${empResponse.data.FirstName} ${empResponse.data.LastName}`
                }
              } catch (err) {
                console.error(`Failed to fetch reviewer name for EmpID ${empId}:`, err)
                reviewerNamesMap[empId] = 'Unknown'
              }
            })
          )

          setReviewerNames(reviewerNamesMap)
        } else {
          setAllEmployeeReviews([])
          setReviewerNames({})
        }
      } catch (error) {
        console.error('Failed to fetch all reviews:', error)
        setAllEmployeeReviews([])
        setReviewerNames({})
        notify.error('Failed to load employee reviews')
      } finally {
        setLoadingAllReviews(false)
      }
    }

    fetchAllEmployeeReviews()
  }, [selectedReviewEmpId, selectedSessionId])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reviewEmployeeDropdownRef.current && 
          !reviewEmployeeDropdownRef.current.contains(event.target)) {
        setShowReviewEmployeeDropdown(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowReviewEmployeeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Handle review employee selection
  const handleReviewEmployeeSelect = (employee) => {
    setSelectedReviewEmpId(employee.EmpID.toString())
    setReviewEmployeeSearch(`${employee.EmpID} - ${employee.FirstName} ${employee.LastName}`)
    setSelectedReviewEmployee(employee)
    setShowReviewEmployeeDropdown(false)
    setSelectedReviewDetail(null)
    
    // Remove focus from input field
    if (reviewEmployeeInputRef.current) {
      reviewEmployeeInputRef.current.blur()
    }
  }

  // Handle search change
  const handleReviewEmployeeSearchChange = (value) => {
    setReviewEmployeeSearch(value)
    setShowReviewEmployeeDropdown(true)
    // Don't clear selected employee and reviews when user is typing/backspacing
    // Only clear when explicitly selecting a new employee
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedReviewEmpId('')
    setReviewEmployeeSearch('')
    setSelectedReviewEmployee(null)
    setAllEmployeeReviews([])
    setSelectedReviewDetail(null)
    setReviewerNames({})
  }

  // Handle review detail selection
  const handleViewReviewDetail = (review) => {
    setSelectedReviewDetail(review)
  }

  // Close review detail
  const closeReviewDetail = () => {
    setSelectedReviewDetail(null)
  }

  // Regularization handlers
  const handleRegularizeClick = (review) => {
    console.log('=== REGULARIZATION CLICK ===')
    console.log('Selected review for regularization:', review)
    console.log('============================')
    
    setSelectedReviewForRegularization(review)
    setRegularizationFormData({
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

  const handleRegularizationFormChange = (field, value) => {
    setRegularizationFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateRegularizationScores = () => {
    // Performance Score
    const performanceValues = [
      parseInt(regularizationFormData.SelfDevelopment) || 0,
      parseInt(regularizationFormData.EmployeeStaffDevelopment) || 0,
      parseInt(regularizationFormData.DecisionMaking) || 0,
      parseInt(regularizationFormData.ProductivityEfficiency) || 0,
      parseInt(regularizationFormData.CallForDuty) || 0
    ].filter(val => val > 0)
    const performanceScore = performanceValues.length > 0
      ? performanceValues.reduce((sum, val) => sum + val, 0) / performanceValues.length
      : 0

    // Discipline Score
    const disciplineValues = [
      parseInt(regularizationFormData.AttendancePunctuality) || 0,
      parseInt(regularizationFormData.BehaviourOverallDiscipline) || 0
    ].filter(val => val > 0)
    const disciplineScore = disciplineValues.length > 0
      ? disciplineValues.reduce((sum, val) => sum + val, 0) / disciplineValues.length
      : 0

    // Integrity Score
    const integrityValues = [
      parseInt(regularizationFormData.Integrity) || 0,
      parseInt(regularizationFormData.LoyaltySubmissionToCompanyGoals) || 0
    ].filter(val => val > 0)
    const integrityScore = integrityValues.length > 0
      ? integrityValues.reduce((sum, val) => sum + val, 0) / integrityValues.length
      : 0

    // Final Percentage
    const finalPercentage = (performanceScore * 0.6 + disciplineScore * 0.2 + integrityScore * 0.2) / 4 * 100

    return {
      performanceScore: Math.round(performanceScore * 100) / 100,
      disciplineScore: Math.round(disciplineScore * 100) / 100,
      integrityScore: Math.round(integrityScore * 100) / 100,
      finalPercentage: Math.round(finalPercentage * 100) / 100
    }
  }

  const handleSubmitRegularization = async () => {
    if (!selectedReviewForRegularization || !selectedReviewEmpId) {
      return notify.error('No review selected for regularization')
    }

    setIsSubmittingRegularization(true)
    try {
      const scores = calculateRegularizationScores()
      const currentDate = new Date()

      const payload = {
        EAID: 0,
        EmpID: parseInt(selectedReviewEmpId),
        RSID: parseInt(selectedSessionId),
        SessionID: parseInt(selectedSessionId),
        SelfDevelopment: parseInt(regularizationFormData.SelfDevelopment) || 0,
        EmployeeStaffDevelopment: parseInt(regularizationFormData.EmployeeStaffDevelopment) || 0,
        DecisionMaking: parseInt(regularizationFormData.DecisionMaking) || 0,
        ProductivityEfficiency: parseInt(regularizationFormData.ProductivityEfficiency) || 0,
        CallForDuty: parseInt(regularizationFormData.CallForDuty) || 0,
        PerformanceScore: scores.performanceScore,
        AttendancePunctuality: parseInt(regularizationFormData.AttendancePunctuality) || 0,
        BehaviourOverallDiscipline: parseInt(regularizationFormData.BehaviourOverallDiscipline) || 0,
        DisciplineScore: scores.disciplineScore,
        Integrity: parseInt(regularizationFormData.Integrity) || 0,
        LoyaltySubmissionToCompanyGoals: parseInt(regularizationFormData.LoyaltySubmissionToCompanyGoals) || 0,
        IntegrityScore: scores.integrityScore,
        FinalPercentage: scores.finalPercentage,
        FinalRemark: regularizationFormData.FinalRemark || '',
        SubmittedAt: currentDate.toISOString(),
        Month: currentDate.getMonth() + 1,
        Year: currentDate.getFullYear(),
        SubmittedBy: currentEmployee?.EmpID || 0
      }

      await API.post('/EmpAssessments', payload)
      notify.success('Regularized review submitted successfully!')

      // Refresh the reviews list using the same endpoint as initial load
      const response = await API.get(`/EmpAssessments/GetAllreviews/${selectedReviewEmpId}/${selectedSessionId}`)
      if (response.data && Array.isArray(response.data)) {
        setAllEmployeeReviews(response.data)

        // Fetch reviewer names for any new reviewers
        const uniqueReviewerIds = [...new Set(response.data.map(review => review.SubmittedBy).filter(id => id))]
        const reviewerNamesMap = { ...reviewerNames }

        await Promise.all(
          uniqueReviewerIds.map(async (empId) => {
            if (!reviewerNamesMap[empId]) {
              try {
                const empResponse = await API.get(`/Employees/${empId}`)
                if (empResponse.data) {
                  reviewerNamesMap[empId] = `${empResponse.data.FirstName} ${empResponse.data.LastName}`
                }
              } catch (err) {
                console.error(`Failed to fetch reviewer name for EmpID ${empId}:`, err)
                reviewerNamesMap[empId] = 'Unknown'
              }
            }
          })
        )

        setReviewerNames(reviewerNamesMap)
      } else {
        setAllEmployeeReviews([])
      }

      // Clear the regularization form
      setSelectedReviewForRegularization(null)
      setRegularizationFormData({
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
    } catch (error) {
      console.error('Failed to submit regularized review:', error)
      notify.error('Failed to submit regularized review')
    } finally {
      setIsSubmittingRegularization(false)
    }
  }

  const handleCancelRegularization = () => {
    setSelectedReviewForRegularization(null)
    setRegularizationFormData({
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

  return {
    // State
    showViewAllReviewsTab,
    isHRDepartment,
    allReviewsEmployees,
    filteredAllReviewsEmployees,
    selectedReviewEmployee,
    selectedReviewEmpId,
    reviewEmployeeSearch,
    showReviewEmployeeDropdown,
    allEmployeeReviews,
    loadingAllReviews,
    selectedReviewDetail,
    reviewerNames,

    // Regularization states
    selectedReviewForRegularization,
    regularizationFormData,
    isSubmittingRegularization,

    // Refs
    reviewEmployeeDropdownRef,
    reviewEmployeeInputRef,

    // Setters
    setShowReviewEmployeeDropdown,
    setSelectedReviewDetail,

    // Actions
    handleReviewEmployeeSelect,
    handleReviewEmployeeSearchChange,
    handleViewReviewDetail,
    closeReviewDetail,
    clearSelection,

    // Regularization actions
    handleRegularizeClick,
    handleRegularizationFormChange,
    calculateRegularizationScores,
    handleSubmitRegularization,
    handleCancelRegularization
  }
}

export default useViewAllReviews