import { CATEGORY_WEIGHTAGES, CATEGORY_IDS } from './constants'

/**
 * Helper function to map review data to parameter values
 */
export const getParameterValueFromReview = (review, parameter) => {
  const paramName = parameter.ParameterName.toLowerCase()

  if (paramName.includes('self development')) return review.SelfDevelopment
  if (paramName.includes('employee') && paramName.includes('staff development')) return review.EmployeeStaffDevelopment
  if (paramName.includes('decision making')) return review.DecisionMaking
  if (paramName.includes('productivity')) return review.ProductivityEfficiency
  if (paramName.includes('call for duty')) return review.CallForDuty
  if (paramName.includes('attendance')) return review.AttendancePunctuality
  if (paramName.includes('behaviour')) return review.BehaviourOverallDiscipline
  if (paramName.includes('integrity') && !paramName.includes('loyalty')) return review.Integrity
  if (paramName.includes('loyalty')) return review.LoyaltySubmissionToCompanyGoals

  return 0
}

/**
 * Calculate category scores for an employee
 */
export const calculateCategoryScore = (empId, categoryId, assessmentData = {}, reviewParameters = []) => {
  if (!Array.isArray(reviewParameters) || !assessmentData) {
    return 0
  }
  
  const categoryParams = reviewParameters.filter(p => p.CategoryID === categoryId)
  const values = categoryParams.map(param => {
    const key = `${empId}_${param.ReviewParameterID}`
    return assessmentData[key] || 0
  }).filter(val => val > 0)

  if (values.length === 0) return 0
  return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100
}

/**
 * Calculate final percentage for an employee
 */
export const calculateFinalPercentage = (empId, assessmentData = {}, reviewParameters = [], categories = []) => {
  if (!Array.isArray(reviewParameters) || !assessmentData) {
    return 0
  }
  
  // Fixed category weightages
  const cat1Score = calculateCategoryScore(empId, CATEGORY_IDS.PERFORMANCE, assessmentData, reviewParameters) // Performance - 60%
  const cat2Score = calculateCategoryScore(empId, CATEGORY_IDS.DISCIPLINE, assessmentData, reviewParameters) // Discipline - 20%
  const cat3Score = calculateCategoryScore(empId, CATEGORY_IDS.INTEGRITY, assessmentData, reviewParameters) // Integrity - 20%

  // Calculate weighted score: (K4*0.6+N4*0.2+Q4*0.2)/4*100
  const finalScore = ((cat1Score * CATEGORY_WEIGHTAGES.PERFORMANCE) + 
                      (cat2Score * CATEGORY_WEIGHTAGES.DISCIPLINE) + 
                      (cat3Score * CATEGORY_WEIGHTAGES.INTEGRITY)) / 4 * 100

  return Math.round(finalScore * 100) / 100
}

/**
 * Check if an employee has been assessed
 */
export const isEmployeeAssessed = (empId, reviewParameters = [], assessmentData = {}) => {
  if (!Array.isArray(reviewParameters) || !assessmentData) {
    return false
  }
  
  // Check if any assessment data exists for this employee
  const hasAssessmentData = reviewParameters.some(param => {
    const key = `${empId}_${param.ReviewParameterID}`
    return assessmentData[key] && assessmentData[key] > 0
  })
  return hasAssessmentData
}

/**
 * Filter employees based on assessment status
 */
export const getFilteredEmployees = (employeeList = [], filterType, reviewParameters = [], assessmentData = {}) => {
  if (!filterType || !Array.isArray(employeeList)) return employeeList
  
  return employeeList.filter(emp => {
    const isAssessed = isEmployeeAssessed(emp.EmpID, reviewParameters, assessmentData)
    if (filterType === 'assessed') return isAssessed
    if (filterType === 'remaining') return !isAssessed
    return true
  })
}

/**
 * Get category weightage (sum of parameter weightages in category)
 */
export const getCategoryWeightage = (categoryId, reviewParameters = []) => {
  if (!Array.isArray(reviewParameters)) {
    return 0
  }
  const categoryParams = reviewParameters.filter(p => p.CategoryID === categoryId)
  return categoryParams.reduce((sum, param) => sum + (param.Weightage || 0), 0)
}

/**
 * Calculate scores for imported row
 */
export const calculateImportedRowScores = (row) => {
  // Performance Score (60%)
  const performanceParams = [
    row.selfDevelopment,
    row.employeeStaffDevelopment,
    row.decisionMaking,
    row.productivityEfficiency,
    row.callForDuty
  ].filter(val => val > 0)
  
  const performanceScore = performanceParams.length > 0
    ? Math.round((performanceParams.reduce((sum, val) => sum + val, 0) / performanceParams.length) * 100) / 100
    : 0

  // Discipline Score (20%)
  const disciplineParams = [
    row.attendancePunctuality,
    row.behaviourOverallDiscipline
  ].filter(val => val > 0)
  
  const disciplineScore = disciplineParams.length > 0
    ? Math.round((disciplineParams.reduce((sum, val) => sum + val, 0) / disciplineParams.length) * 100) / 100
    : 0

  // Integrity Score (20%)
  const integrityParams = [
    row.integrity,
    row.loyaltySubmissionToCompanyGoals
  ].filter(val => val > 0)
  
  const integrityScore = integrityParams.length > 0
    ? Math.round((integrityParams.reduce((sum, val) => sum + val, 0) / integrityParams.length) * 100) / 100
    : 0

  // Total Weightage
  const totalWeightage = ((performanceScore * CATEGORY_WEIGHTAGES.PERFORMANCE) + 
                          (disciplineScore * CATEGORY_WEIGHTAGES.DISCIPLINE) + 
                          (integrityScore * CATEGORY_WEIGHTAGES.INTEGRITY)) / 4 * 100

  return {
    performanceScore,
    disciplineScore,
    integrityScore,
    totalWeightage: Math.round(totalWeightage * 100) / 100
  }
}