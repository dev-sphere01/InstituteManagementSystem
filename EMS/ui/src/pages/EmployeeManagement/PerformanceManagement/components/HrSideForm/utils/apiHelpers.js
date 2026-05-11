import { API } from '@/services'
import { calculateCategoryScore, calculateFinalPercentage } from './calculationHelpers'
import { calculateRating } from './ratingHelpers'

/**
 * Submit assessments for employees (only changed data)
 */
export const submitAssessments = async ({
  employees = [],
  changedEmployees = null, // Optional: pre-filtered list of changed employees
  sessionId,
  reviewParameters = [],
  assessmentData = {},
  finalRemarks = {},
  currentEmployee,
  notify,
  isHindi
}) => {
  // Use changedEmployees if provided, otherwise fall back to all employees
  const employeesToSubmit = changedEmployees || employees
  
  // Validation
  if (!Array.isArray(employeesToSubmit) || employeesToSubmit.length === 0) {
    throw new Error('No employees with changes found for submission')
  }
  
  // Debug: Log currentEmployee to verify it's being passed
  console.log('submitAssessments - currentEmployee:', currentEmployee?.EmpID)
  
  if (!sessionId) {
    throw new Error('No session ID provided')
  }
  
  if (!Array.isArray(reviewParameters) || reviewParameters.length === 0) {
    throw new Error('No review parameters provided')
  }

  const currentDate = new Date()
  const payloads = []

  employeesToSubmit.forEach(employee => {
    const empId = employee.EmpID

    // Check if employee has any assessment data or final remarks
    const hasAssessmentData = reviewParameters.some(param => {
      const key = `${empId}_${param.ReviewParameterID}`
      return assessmentData[key] > 0
    })

    const hasFinalRemarks = finalRemarks[empId] && finalRemarks[empId].trim() !== ''

    if (!hasAssessmentData && !hasFinalRemarks) return // Skip employees with no data or remarks

    // Calculate scores
    const performanceScore = calculateCategoryScore(empId, 1, assessmentData, reviewParameters)
    const disciplineScore = calculateCategoryScore(empId, 2, assessmentData, reviewParameters)
    const integrityScore = calculateCategoryScore(empId, 3, assessmentData, reviewParameters)
    const finalPercentage = calculateFinalPercentage(empId, assessmentData, reviewParameters)

    const payload = {
      EAID: 0,
      EmpID: empId,
      RSID: parseInt(sessionId),
      SessionID: parseInt(sessionId),
      SelfDevelopment: assessmentData[`${empId}_1`] || 0,
      EmployeeStaffDevelopment: assessmentData[`${empId}_2`] || 0,
      DecisionMaking: assessmentData[`${empId}_3`] || 0,
      ProductivityEfficiency: assessmentData[`${empId}_4`] || 0,
      CallForDuty: assessmentData[`${empId}_5`] || 0,
      PerformanceScore: performanceScore,
      AttendancePunctuality: assessmentData[`${empId}_6`] || 0,
      BehaviourOverallDiscipline: assessmentData[`${empId}_7`] || 0,
      DisciplineScore: disciplineScore,
      Integrity: assessmentData[`${empId}_8`] || 0,
      LoyaltySubmissionToCompanyGoals: assessmentData[`${empId}_9`] || 0,
      IntegrityScore: integrityScore,
      FinalPercentage: finalPercentage,
      Rating: calculateRating(finalPercentage),
      FinalRemark: finalRemarks[empId] || '',
      SubmittedAt: currentDate.toISOString(),
      Month: currentDate.getMonth() + 1,
      Year: currentDate.getFullYear(),
      SubmittedBy: currentEmployee?.EmpID || 0
    }

    payloads.push(payload)
  })

  if (payloads.length === 0) {
    throw new Error('No assessments to submit. Please fill in at least one employee assessment.')
  }

  // Submit all assessments
  for (const payload of payloads) {
    await API.post('/EmpAssessments', payload)
  }

  return payloads.length
}

/**
 * Submit bulk assessments from imported data
 */
export const submitBulkAssessments = async ({
  importedData = [],
  sessionId,
  reviewParameters = [],
  currentEmployee,
  notify,
  isHindi
}) => {
  // Validation
  if (!Array.isArray(importedData) || importedData.length === 0) {
    throw new Error('No imported data provided for bulk submission')
  }
  
  if (!sessionId) {
    throw new Error('No session ID provided')
  }

  // Calculate scores for imported row (inline implementation)
  const calculateScoresForRow = (row) => {
    // Performance Score (60%)
    const performanceParams = [
      parseInt(row.selfDevelopment) || 0,
      parseInt(row.employeeStaffDevelopment) || 0,
      parseInt(row.decisionMaking) || 0,
      parseInt(row.productivityEfficiency) || 0,
      parseInt(row.callForDuty) || 0
    ].filter(val => val > 0)
    
    const performanceScore = performanceParams.length > 0
      ? Math.round((performanceParams.reduce((sum, val) => sum + val, 0) / performanceParams.length) * 100) / 100
      : 0

    // Discipline Score (20%)
    const disciplineParams = [
      parseInt(row.attendancePunctuality) || 0,
      parseInt(row.behaviourOverallDiscipline) || 0
    ].filter(val => val > 0)
    
    const disciplineScore = disciplineParams.length > 0
      ? Math.round((disciplineParams.reduce((sum, val) => sum + val, 0) / disciplineParams.length) * 100) / 100
      : 0

    // Integrity Score (20%)
    const integrityParams = [
      parseInt(row.integrity) || 0,
      parseInt(row.loyaltySubmissionToCompanyGoals) || 0
    ].filter(val => val > 0)
    
    const integrityScore = integrityParams.length > 0
      ? Math.round((integrityParams.reduce((sum, val) => sum + val, 0) / integrityParams.length) * 100) / 100
      : 0

    // Total Weightage
    const totalWeightage = ((performanceScore * 0.6) + 
                            (disciplineScore * 0.2) + 
                            (integrityScore * 0.2)) / 4 * 100

    return {
      performanceScore,
      disciplineScore,
      integrityScore,
      totalWeightage: Math.round(totalWeightage * 100) / 100
    }
  }

  const currentDate = new Date()
  const payloads = []

  for (const row of importedData) {
    // Validate that empNo exists
    if (!row.empNo) {
      console.warn('Row missing empNo, skipping...', row)
      continue
    }

    const scores = calculateScoresForRow(row)

    const payload = {
      EAID: 0,
      EmpID: parseInt(row.empNo),
      RSID: parseInt(sessionId),
      SessionID: parseInt(sessionId),
      SelfDevelopment: parseInt(row.selfDevelopment) || 0,
      EmployeeStaffDevelopment: parseInt(row.employeeStaffDevelopment) || 0,
      DecisionMaking: parseInt(row.decisionMaking) || 0,
      ProductivityEfficiency: parseInt(row.productivityEfficiency) || 0,
      CallForDuty: parseInt(row.callForDuty) || 0,
      PerformanceScore: scores.performanceScore,
      AttendancePunctuality: parseInt(row.attendancePunctuality) || 0,
      BehaviourOverallDiscipline: parseInt(row.behaviourOverallDiscipline) || 0,
      DisciplineScore: scores.disciplineScore,
      Integrity: parseInt(row.integrity) || 0,
      LoyaltySubmissionToCompanyGoals: parseInt(row.loyaltySubmissionToCompanyGoals) || 0,
      IntegrityScore: scores.integrityScore,
      FinalPercentage: scores.totalWeightage,
      Rating: calculateRating(scores.totalWeightage),
      FinalRemark: row.finalRemark || '',
      SubmittedAt: currentDate.toISOString(),
      Month: currentDate.getMonth() + 1,
      Year: currentDate.getFullYear(),
      SubmittedBy: currentEmployee?.EmpID || 0
    }

    payloads.push(payload)
  }

  if (payloads.length === 0) {
    throw new Error('No valid employee records found in the imported data')
  }

  // Submit all assessments
  for (const payload of payloads) {
    await API.post('/EmpAssessments', payload)
  }

  return payloads.length
}

/**
 * Submit random assessment assignment
 */
export const submitRandomAssessment = async ({
  selectedAssessor,
  selectedAssessees,
  selectedSessionId
}) => {
  if (!selectedAssessor) {
    throw new Error('Please select an assessor')
  }
  if (selectedAssessees.length === 0) {
    throw new Error('Please select at least one assessee')
  }

  const currentDate = new Date()
  const payload = {
    RAID: 0,
    AssessorID: selectedAssessor.EmpID,
    AssesseeIDs: selectedAssessees.map(emp => emp.EmpID),
    Month: currentDate.getMonth() + 1,
    Year: currentDate.getFullYear(),
    RSID: selectedSessionId
  }

  await API.post('/RandomAssessments', payload)
}

/**
 * Submit regularization data
 */
export const submitRegularization = async ({
  reviewId,
  formData,
  currentEmployee
}) => {
  const currentDate = new Date()
  
  const payload = {
    ...formData,
    EAID: reviewId,
    RegularizedBy: currentEmployee?.EmpID || 0,
    RegularizedAt: currentDate.toISOString()
  }

  await API.put(`/EmpAssessments/${reviewId}`, payload)
}

/**
 * Fetch direct report employees
 */
export const fetchDirectReportEmployees = async (empId) => {
  const response = await API.get(`/Employees/GetDirectReports/${empId}`)
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Fetch assigned employees for review
 */
export const fetchAssignedEmployees = async (empId, sessionId) => {
  const response = await API.get(`/RandomAssessments/GetAssignedEmployees/${empId}/${sessionId}`)
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Fetch all employees
 */
export const fetchAllEmployees = async () => {
  const response = await API.get('/Employees')
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Fetch all reviews for an employee
 */
export const fetchEmployeeReviews = async (empId, sessionId) => {
  const response = await API.get(`/EmpAssessments/GetReviewsByEmpID/${empId}/${sessionId}`)
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Fetch reviewer name
 */
export const fetchReviewerName = async (empId) => {
  try {
    const response = await API.get(`/Employees/${empId}`)
    return response.data?.Name || 'Unknown'
  } catch (error) {
    console.error(`Failed to fetch reviewer name for EmpID ${empId}:`, error)
    return 'Unknown'
  }
}