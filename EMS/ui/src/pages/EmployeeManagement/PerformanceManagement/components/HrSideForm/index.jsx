/**
 * HrSideForm - Main Component
 * 
 * Refactored modular version of the HR Performance Review Form
 * This is the main orchestrator that manages:
 * - Tab navigation
 * - Session selection
 * - Global state coordination
 * - Integration of all child components
 * 
 * Props:
 * - selectedSessionId: Currently selected review session
 * - reviewSessions: List of available review sessions
 * - loadingSessions: Loading state for sessions
 * - areReviewsLocked: Whether reviews are locked for editing
 * - setAreReviewsLocked: Function to update lock state
 * - isHindi: Language preference (Hindi/English)
 * - setIsHindi: Function to update language
 * - reviewStats: Statistics about reviews
 * - loadingStats: Loading state for stats
 * - overallFilter: Global filter state
 */

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, AlertCircle } from 'lucide-react'
import { notification } from '@/services'
import useEmpDataStore from '@/store/empDataStore'

// Components
import TabNavigation from './components/TabNavigation'

// Tabs
import AssessmentTab from './tabs/AssessmentTab'
import RandomAssessmentTab from './tabs/RandomAssessmentTab'
import ReviewAssignedTab from './tabs/ReviewAssignedTab'
import ViewAllReviewsTab from './tabs/ViewAllReviewsTab'

// Hooks
import useReviewParameters from './hooks/useReviewParameters'
import useAssessmentData from './hooks/useAssessmentData'
import useEmployeeSearch from './hooks/useEmployeeSearch'
import useRandomAssessment from './hooks/useRandomAssessment'
import useAssignedReviews from './hooks/useAssignedReviews'
import useViewAllReviews from './hooks/useViewAllReviews'

// Utils
import { TABS } from './utils/constants'
import { 
  calculateCategoryScore, 
  calculateFinalPercentage, 
  getCategoryWeightage 
} from './utils/calculationHelpers'
import { 
  submitAssessments, 
  submitBulkAssessments 
} from './utils/apiHelpers'

const HrSideForm = ({
  selectedSessionId,
  reviewSessions,
  loadingSessions,
  areReviewsLocked,
  setAreReviewsLocked,
  isHindi,
  setIsHindi,
  reviewStats,
  loadingStats,
  overallFilter
}) => {
  const notify = notification()
  const { currentEmployee } = useEmpDataStore()

  // Tab state
  const [activeTab, setActiveTab] = useState('assessment')

  // Import mode state
  const [isImportMode, setIsImportMode] = useState(false)
  const [importedData, setImportedData] = useState([])

  // Define field mapping for Excel import
  const predefinedFields = [
    { key: 'empNo', label: 'Emp No', required: true, variations: ['emp no', 'empno', 'employee number', 'employee no'] },
    { key: 'name', label: 'Name', required: true, variations: ['name', 'employee name', 'emp name'] },
    { key: 'department', label: 'Department', required: false, variations: ['department', 'dept'] },
    { key: 'manager', label: 'Manager', required: false, variations: ['manager', 'reporting manager'] },
    { key: 'selfDevelopment', label: 'Self Development', required: true, variations: ['self development', 'selfdevelopment'] },
    { key: 'employeeStaffDevelopment', label: 'Employee/Staff Development', required: true, variations: ['employee / staff development', 'employee staff development', 'staff development'] },
    { key: 'decisionMaking', label: 'Decision Making', required: true, variations: ['decision making', 'decisionmaking'] },
    { key: 'productivityEfficiency', label: 'Productivity/Efficiency', required: true, variations: ['productivity / efficiency - timely completion of targets', 'productivity efficiency', 'productivity', 'efficiency'] },
    { key: 'callForDuty', label: 'Call for Duty', required: true, variations: ['call for duty', 'callforduty'] },
    { key: 'performanceScore', label: 'Performance Score', required: false, variations: ['score', 'performance score'] },
    { key: 'attendancePunctuality', label: 'Attendance & Punctuality', required: true, variations: ['attendance & punctuality', 'attendance and punctuality', 'attendance'] },
    { key: 'behaviourOverallDiscipline', label: 'Behaviour/Overall Discipline', required: true, variations: ['behaviour/overall discipline', 'behaviour overall discipline', 'behaviour', 'discipline'] },
    { key: 'disciplineScore', label: 'Discipline Score', required: false, variations: ['score', 'discipline score'] },
    { key: 'integrity', label: 'Integrity', required: true, variations: ['integrity'] },
    { key: 'loyaltySubmissionToCompanyGoals', label: 'Loyalty/Submission to Company Goals', required: true, variations: ['loyalty/submission to company goals', 'loyalty submission to company goals', 'loyalty'] },
    { key: 'integrityScore', label: 'Integrity Score', required: false, variations: ['score', 'integrity score'] },
    { key: 'totalWeightage', label: 'Total Weightage', required: false, variations: ['total weightage', 'totalweightage', 'final score'] }
  ]

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================================================
  // HOOKS - Data Management
  // ============================================================================

  // Review parameters and categories
  const {
    reviewParameters,
    categories,
    isLoading: loadingParameters
  } = useReviewParameters(selectedSessionId)

  // Assessment data for main assessment tab
  const {
    employees,
    filteredEmployees,
    assessmentFilteredEmployees,
    assessmentData,
    finalRemarks,
    assessmentFilter,
    assessmentStats,
    handleAssessmentFilterChange,
    handleAssessmentChange,
    handleFinalRemarkChange,
    handleFilterChange,
    loadAssessments,
    getChangedEmployees,
    hasEmployeeDataChanged
  } = useAssessmentData(selectedSessionId, reviewParameters, overallFilter)

  // Employee search for main assessment tab
  const {
    searchValue: employeeSearchValue,
    filteredEmployees: searchFilteredEmployees,
    showDropdown: showEmployeeDropdown,
    dropdownRef: employeeDropdownRef,
    handleSearchChange: handleEmployeeSearchChange,
    handleDropdownToggle: handleEmployeeDropdownToggle
  } = useEmployeeSearch(employees)

  // View all reviews hook (HR only) - Must be called before randomAssessment
  const viewAllReviews = useViewAllReviews(
    currentEmployee,
    selectedSessionId
  )

  // Random assessment hook
  const randomAssessment = useRandomAssessment(selectedSessionId, viewAllReviews.allReviewsEmployees)

  // Assigned reviews hook
  const assignedReviews = useAssignedReviews(
    currentEmployee,
    selectedSessionId,
    reviewParameters
  )

  // Extract tab visibility flags from hooks
  const showReviewAssignedTab = assignedReviews.showReviewAssignedTab
  const showViewAllReviewsTab = viewAllReviews.showViewAllReviewsTab
  const showRandomAssessmentTab = viewAllReviews.showViewAllReviewsTab // Same logic as viewAll - HR only

  // Debug: Log tab visibility
  console.log('🔍 TAB VISIBILITY DEBUG:', {
    showReviewAssignedTab,
    showViewAllReviewsTab,
    showRandomAssessmentTab,
    currentEmployeeId: currentEmployee?.EmpID,
    viewAllReviewsTabFromHook: viewAllReviews.showViewAllReviewsTab
  })
  
  // Additional debug for random assessment
  console.log('🎲 RANDOM ASSESSMENT TAB:', {
    shouldShow: showRandomAssessmentTab,
    sameAsViewAll: showRandomAssessmentTab === showViewAllReviewsTab,
    viewAllTabStatus: showViewAllReviewsTab
  })

  // ============================================================================
  // HANDLERS - Actions
  // ============================================================================

  /**
   * Handle tab change
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // Reset import mode when changing tabs
    if (tabId !== 'assessment') {
      setIsImportMode(false)
      setImportedData([])
    }
  }

  /**
   * Handle import mode toggle
   */
  const handleImportModeToggle = () => {
    setIsImportMode(!isImportMode)
    if (isImportMode) {
      setImportedData([])
    }
  }

  /**
   * Handle imported data change
   */
  const handleImportDataChange = useCallback((data) => {
    setImportedData(data)
  }, [])

  /**
   * Handle assessment submission (normal mode)
   */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Get only employees with changes
      const changedEmployees = getChangedEmployees ? getChangedEmployees() : filteredEmployees
      
      if (changedEmployees.length === 0) {
        notify.info(
          isHindi 
            ? 'कोई बदलाव नहीं मिला। कृपया डेटा अपडेट करें।'
            : 'No changes found. Please update data before submitting.'
        )
        return
      }
      
      await submitAssessments({
        sessionId: selectedSessionId,
        assessmentData,
        finalRemarks,
        reviewParameters,
        employees: filteredEmployees,
        changedEmployees, // Pass only changed employees
        currentEmployee,
        notify,
        isHindi
      })

      // Reload assessments after successful submission
      await loadAssessments()
      
      notify.success(
        isHindi 
          ? `${changedEmployees.length} मूल्यांकन सफलतापूर्वक सबमिट किए गए`
          : `${changedEmployees.length} assessments submitted successfully`
      )
    } catch (error) {
      console.error('Error submitting assessments:', error)
      notify.error(
        isHindi 
          ? 'मूल्यांकन सबमिट करने में त्रुटि'
          : 'Error submitting assessments'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle bulk submission (import mode)
   */
  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      await submitBulkAssessments({
        sessionId: selectedSessionId,
        importedData,
        reviewParameters,
        currentEmployee,
        notify,
        isHindi
      })

      // Reset import mode and reload
      setImportedData([])
      setIsImportMode(false)
      await loadAssessments()
      
      notify.success(
        isHindi 
          ? 'सभी मूल्यांकन सफलतापूर्वक सबमिट किए गए'
          : 'All assessments submitted successfully'
      )
    } catch (error) {
      console.error('Error submitting bulk assessments:', error)
      notify.error(
        isHindi 
          ? 'बल्क मूल्यांकन सबमिट करने में त्रुटि'
          : 'Error submitting bulk assessments'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle assigned reviews submission
   */
  const handleAssignedReviewsSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Get only employees with changes
      const changedEmployees = assignedReviews.getChangedEmployees ? assignedReviews.getChangedEmployees() : assignedReviews.filteredAssignedEmployees
      
      if (changedEmployees.length === 0) {
        notify.info(
          isHindi 
            ? 'कोई बदलाव नहीं मिला। कृपया डेटा अपडेट करें।'
            : 'No changes found. Please update data before submitting.'
        )
        return
      }
      
      await submitAssessments({
        sessionId: selectedSessionId,
        assessmentData: assignedReviews.assessmentData,
        finalRemarks: assignedReviews.finalRemarks,
        reviewParameters,
        employees: assignedReviews.filteredAssignedEmployees,
        changedEmployees, // Pass only changed employees
        currentEmployee,
        notify,
        isHindi
      })

      // Reload assigned reviews and existing assessments
      await assignedReviews.loadAssignedEmployees()
      await assignedReviews.loadExistingReviews()
      
      notify.success(
        isHindi 
          ? `${changedEmployees.length} असाइन किए गए मूल्यांकन सबमिट किए गए`
          : `${changedEmployees.length} assigned reviews submitted successfully`
      )
    } catch (error) {
      console.error('Error submitting assigned reviews:', error)
      notify.error(
        isHindi 
          ? 'असाइन किए गए मूल्यांकन सबमिट करने में त्रुटि'
          : 'Error submitting assigned reviews'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render active tab content
   */
  const renderTabContent = () => {
    // No session selected
    if (!selectedSessionId) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Calendar size={64} className="mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {isHindi ? 'कोई सत्र चयनित नहीं' : 'No Session Selected'}
            </h4>
            <p className="text-gray-500 max-w-md mx-auto">
              {isHindi 
                ? 'कृपया आरंभ करने के लिए एक समीक्षा सत्र चुनें'
                : 'Please select a review session to get started'
              }
            </p>
          </div>
        </div>
      )
    }

    // Loading state
    if (loadingParameters) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">
              {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        </div>
      )
    }

    // Render appropriate tab
    switch (activeTab) {
      case 'assessment':
        return (
          <AssessmentTab
            employees={employees}
            filteredEmployees={filteredEmployees}
            assessmentFilteredEmployees={assessmentFilteredEmployees}
            categories={categories}
            reviewParameters={reviewParameters}
            assessmentData={assessmentData}
            finalRemarks={finalRemarks}
            predefinedFields={predefinedFields}
            assessmentFilter={assessmentFilter}
            assessmentStats={assessmentStats}
            handleAssessmentFilterChange={handleAssessmentFilterChange}
            isHindi={isHindi}
            areReviewsLocked={areReviewsLocked}
            overallFilter={overallFilter}
            isImportMode={isImportMode}
            importedData={importedData}
            onFilterChange={handleFilterChange}
            onAssessmentChange={handleAssessmentChange}
            onFinalRemarkChange={handleFinalRemarkChange}
            onImportModeToggle={handleImportModeToggle}
            onImportDataChange={handleImportDataChange}
            onSubmit={handleSubmit}
            onBulkSubmit={handleBulkSubmit}
            calculateCategoryScore={(empId, catId) => 
              calculateCategoryScore(empId, catId, assessmentData, reviewParameters)
            }
            calculateFinalPercentage={(empId) => 
              calculateFinalPercentage(empId, assessmentData, reviewParameters, categories)
            }
            getCategoryWeightage={(categoryId) => getCategoryWeightage(categoryId, reviewParameters)}
            hasEmployeeDataChanged={hasEmployeeDataChanged}
            isSubmitting={isSubmitting}
            currentEmployee={currentEmployee}
          />
        )

      case 'random':
        return (
          <RandomAssessmentTab
            {...randomAssessment}
            isHindi={isHindi}
            areReviewsLocked={areReviewsLocked}
          />
        )

      case 'assigned':
        return (
          <ReviewAssignedTab
            {...assignedReviews}
            categories={categories}
            reviewParameters={reviewParameters}
            onSubmit={handleAssignedReviewsSubmit}
            calculateCategoryScore={(empId, catId) => 
              calculateCategoryScore(empId, catId, assignedReviews.assessmentData, reviewParameters)
            }
            calculateFinalPercentage={(empId) => 
              calculateFinalPercentage(empId, assignedReviews.assessmentData, reviewParameters, categories)
            }
            getCategoryWeightage={(categoryId) => getCategoryWeightage(categoryId, reviewParameters)}
            hasEmployeeDataChanged={assignedReviews.hasEmployeeDataChanged}
            isHindi={isHindi}
            areReviewsLocked={areReviewsLocked}
            isSubmitting={isSubmitting}
          />
        )

      case 'viewAll':
        return (
          <ViewAllReviewsTab
            {...viewAllReviews}
            selectedSessionId={selectedSessionId}
            categories={categories}
            reviewParameters={reviewParameters}
            calculateCategoryScore={(empId, catId, data) => 
              calculateCategoryScore(empId, catId, data, reviewParameters)
            }
            calculateFinalPercentage={(empId, data) => 
              calculateFinalPercentage(empId, data, reviewParameters, categories)
            }
            getCategoryWeightage={(categoryId) => getCategoryWeightage(categoryId, reviewParameters)}
            isHindi={isHindi}
            areReviewsLocked={areReviewsLocked}
            currentEmployee={currentEmployee}
          />
        )

      default:
        return null
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={TABS}
        isHindi={isHindi}
        showRandomAssessmentTab={showRandomAssessmentTab}
        showReviewAssignedTab={showReviewAssignedTab}
        showViewAllReviewsTab={showViewAllReviewsTab}
      />

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}

export default HrSideForm