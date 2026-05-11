/**
 * AssessmentTab Component
 * 
 * Main assessment tab that orchestrates the employee performance assessment workflow
 * Features:
 * - Filter buttons for employee filtering (All/Completed/Pending)
 * - Import mode toggle for bulk Excel import
 * - Assessment grid for individual employee assessments
 * - Submit functionality for saving assessments
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, FileSpreadsheet } from 'lucide-react'
import FilterButtons from '../components/FilterButtons'
import AssessmentGrid from '../components/AssessmentGrid'
import ImportModePanel from '../components/ImportModePanel'
import { FILTER_OPTIONS } from '../utils/constants'

const AssessmentTab = ({
  // Data
  employees,
  filteredEmployees,
  assessmentFilteredEmployees,
  categories,
  reviewParameters,
  assessmentData,
  finalRemarks,
  predefinedFields, // Add predefinedFields prop

  // Filter state for AssessmentTab
  assessmentFilter,
  assessmentStats,
  handleAssessmentFilterChange,

  // State
  isHindi,
  areReviewsLocked,
  overallFilter,
  isImportMode,
  importedData,

  // Handlers
  onFilterChange,
  onAssessmentChange,
  onFinalRemarkChange,
  onImportModeToggle,
  onImportDataChange,
  onSubmit,
  onBulkSubmit,

  // Calculation functions
  calculateCategoryScore,
  calculateFinalPercentage,
  getCategoryWeightage,

  // Change tracking
  hasEmployeeDataChanged,

  // Loading state
  isSubmitting,

  // Current employee (for template download)
  currentEmployee
}) =>
{
  // Check if there are any assessments to submit
  const hasAssessments = Object.keys(assessmentData).length > 0
  const hasImportedData = importedData && importedData.length > 0

  // Use AssessmentTab's own filtered employees
  const displayEmployees = assessmentFilteredEmployees || filteredEmployees

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isHindi ? 'कर्मचारी मूल्यांकन' : 'Employee Assessment'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isHindi
              ? `कुल कर्मचारी: ${employees.length} | फ़िल्टर किए गए: ${displayEmployees.length}`
              : `Total Employees: ${employees.length} | Filtered: ${displayEmployees.length}`
            }
          </p>
        </div>

        {/* Import Mode Toggle */}
        <button
          onClick={onImportModeToggle}
          disabled={areReviewsLocked}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isImportMode
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isImportMode ? <FileSpreadsheet size={18} /> : <Upload size={18} />}
          {isImportMode
            ? (isHindi ? 'सामान्य मोड' : 'Normal Mode')
            : (isHindi ? 'आयात मोड' : 'Import Mode')
          }
        </button>
      </div>

      {/* Filter Buttons (only in normal mode) */}
      {!isImportMode && employees.length > 0 && (
        <div className="space-y-3">
          <FilterButtons
            reviewStats={{ DirectReviews: assessmentStats }}
            activeFilter={assessmentFilter}
            onFilterClick={handleAssessmentFilterChange}
            type="direct"
            isHindi={isHindi}
          />
          {assessmentFilter && (
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
              {isHindi
                ? '📌 फ़िल्टर मूल डेटा पर आधारित हैं - संपादन के दौरान कर्मचारी गायब नहीं होंगे'
                : '📌 Filters are based on original data - employees won\'t disappear while editing'
              }
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isImportMode ? (
          /* Import Mode Panel */
          <ImportModePanel
            predefinedFields={predefinedFields}
            importedData={importedData}
            onDataChange={onImportDataChange}
            onFileReset={() => { }} // Add empty function for now
            onBulkSubmit={onBulkSubmit}
            empID={currentEmployee?.EmpID}
            isHindi={isHindi}
            areReviewsLocked={areReviewsLocked}
            reviewParameters={reviewParameters}
            categories={categories}
            calculateCategoryScore={calculateCategoryScore}
            calculateFinalPercentage={calculateFinalPercentage}
            getCategoryWeightage={getCategoryWeightage}
            calculateScoresForRow={(row) =>
            {
              // Add the calculateScoresForRow function
              const performanceValues = [
                parseInt(row.selfDevelopment) || 0,
                parseInt(row.employeeStaffDevelopment) || 0,
                parseInt(row.decisionMaking) || 0,
                parseInt(row.productivityEfficiency) || 0,
                parseInt(row.callForDuty) || 0
              ].filter(val => val > 0)
              const performanceScore = performanceValues.length > 0
                ? performanceValues.reduce((sum, val) => sum + val, 0) / performanceValues.length
                : 0

              const disciplineValues = [
                parseInt(row.attendancePunctuality) || 0,
                parseInt(row.behaviourOverallDiscipline) || 0
              ].filter(val => val > 0)
              const disciplineScore = disciplineValues.length > 0
                ? disciplineValues.reduce((sum, val) => sum + val, 0) / disciplineValues.length
                : 0

              const integrityValues = [
                parseInt(row.integrity) || 0,
                parseInt(row.loyaltySubmissionToCompanyGoals) || 0
              ].filter(val => val > 0)
              const integrityScore = integrityValues.length > 0
                ? integrityValues.reduce((sum, val) => sum + val, 0) / integrityValues.length
                : 0

              const finalPercentage = (performanceScore * 0.6 + disciplineScore * 0.2 + integrityScore * 0.2) / 4 * 100

              return {
                performanceScore: Math.round(performanceScore * 100) / 100,
                disciplineScore: Math.round(disciplineScore * 100) / 100,
                integrityScore: Math.round(integrityScore * 100) / 100,
                finalPercentage: Math.round(finalPercentage * 100) / 100
              }
            }}
          />
        ) : (
          /* Assessment Grid */
          <div className="p-6">
            {displayEmployees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileSpreadsheet size={48} className="mx-auto" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {isHindi ? 'कोई कर्मचारी नहीं मिला' : 'No Employees Found'}
                </h4>
                <p className="text-gray-500">
                  {isHindi
                    ? 'चयनित फ़िल्टर के लिए कोई कर्मचारी उपलब्ध नहीं है'
                    : 'No employees available for the selected filter'
                  }
                </p>
              </div>
            ) : (
              <AssessmentGrid
                employees={displayEmployees}
                categories={categories}
                reviewParameters={reviewParameters}
                assessmentData={assessmentData}
                finalRemarks={finalRemarks}
                isHindi={isHindi}
                areReviewsLocked={areReviewsLocked}
                onAssessmentChange={onAssessmentChange}
                onFinalRemarkChange={onFinalRemarkChange}
                calculateCategoryScore={calculateCategoryScore}
                calculateFinalPercentage={calculateFinalPercentage}
                getCategoryWeightage={getCategoryWeightage}
                hasEmployeeDataChanged={hasEmployeeDataChanged}
                showChangeIndicators={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Changes Summary */}
      {!areReviewsLocked && !isImportMode && hasEmployeeDataChanged && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {isHindi
                ? 'नीले हाइलाइट वाले कर्मचारियों में बदलाव हैं और वे सबमिट किए जाएंगे'
                : 'Employees highlighted in blue have changes and will be submitted'
              }
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!areReviewsLocked && (
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isImportMode ? onBulkSubmit : onSubmit}
            disabled={isSubmitting || (isImportMode ? !hasImportedData : !hasAssessments)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {isHindi ? 'सबमिट हो रहा है...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isImportMode
                  ? (isHindi ? 'सभी सबमिट करें' : 'Save All')
                  : (isHindi ? 'मूल्यांकन सबमिट करें' : 'Save')
                }
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Locked State Message */}
      {areReviewsLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            {isHindi
              ? '⚠️ समीक्षाएं लॉक हैं। कोई परिवर्तन नहीं किया जा सकता।'
              : '⚠️ Reviews are locked. No changes can be made.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default AssessmentTab