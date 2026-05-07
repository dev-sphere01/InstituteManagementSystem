/**
 * ReviewAssignedTab Component
 * 
 * Tab for reviewing employees assigned to the current user as assessor
 * Features:
 * - Displays employees assigned for assessment
 * - Search and filter functionality
 * - Assessment grid for assigned employees
 * - Submit functionality
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Save, UserCheck, Search, AlertCircle } from 'lucide-react'
import AssessmentGrid from '../components/AssessmentGrid'
import FilterButtons from '../components/FilterButtons'

const ReviewAssignedTab = ({
  // Hook state
  hasAssignedReviews,
  assignedEmployees,
  filteredAssignedEmployees,
  searchValue,
  showDropdown,
  dropdownRef,
  isLoading,

  // Hook handlers
  onSearchChange,
  onDropdownToggle,

  // Assessment data
  categories,
  reviewParameters,
  assessmentData,
  finalRemarks,

  // Assessment handlers
  onAssessmentChange,
  onFinalRemarkChange,
  onSubmit,

  // Calculation functions
  calculateCategoryScore,
  calculateFinalPercentage,
  getCategoryWeightage,

  // Change tracking
  hasEmployeeDataChanged,

  // Filter state
  assignedFilter,
  assignedReviewStats,
  handleFilterChange,

  // Props
  isHindi,
  areReviewsLocked,
  isSubmitting
}) =>
{
  // Check if there are any assessments to submit
  const hasAssessments = assessmentData && Object.keys(assessmentData).length > 0

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">
            {isHindi ? 'असाइन किए गए कर्मचारी लोड हो रहे हैं...' : 'Loading assigned employees...'}
          </p>
        </div>
      </div>
    )
  }

  // No assigned reviews
  if (!hasAssignedReviews) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <UserCheck size={64} className="mx-auto" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            {isHindi ? 'कोई असाइन किया गया मूल्यांकन नहीं' : 'No Assigned Reviews'}
          </h4>
          <p className="text-gray-500 max-w-md mx-auto">
            {isHindi
              ? 'आपको वर्तमान में किसी भी कर्मचारी का मूल्यांकन करने के लिए असाइन नहीं किया गया है।'
              : 'You are not currently assigned to assess any employees.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isHindi ? 'दिये गए कर्मचारी का मूल्यांकन' : 'Assigned Employees for Assessment'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isHindi
              ? `कुल दिए गए: ${assignedEmployees.length} | दिखाए गए: ${filteredAssignedEmployees.length}`
              : `Total Assigned: ${assignedEmployees.length} | Showing: ${filteredAssignedEmployees.length}`
            }
          </p>
        </div>

        {/* Employee Search */}
        {assignedEmployees.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[300px]">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isHindi ? 'नाम या ID से खोजें...' : 'Search by name or ID...'}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {searchValue && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {isHindi
                  ? `${filteredAssignedEmployees.length} कर्मचारी मिले`
                  : `${filteredAssignedEmployees.length} found`
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      {assignedEmployees.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FilterButtons
              reviewStats={{ AssignedReviews: assignedReviewStats }}
              activeFilter={assignedFilter}
              onFilterClick={handleFilterChange}
              type="assigned"
              isHindi={isHindi}
            />
          </div>
          {assignedFilter && (
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
              {isHindi 
                ? '📌 फ़िल्टर मूल डेटा पर आधारित हैं - संपादन के दौरान कर्मचारी गायब नहीं होंगे'
                : '📌 Filters are based on original data - employees won\'t disappear while editing'
              }
            </div>
          )}
        </div>
      )}

      {/* Assessment Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredAssignedEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {isHindi ? 'कोई कर्मचारी नहीं मिला' : 'No Employees Found'}
              </h4>
              <p className="text-gray-500">
                {isHindi
                  ? 'खोज मानदंड से मेल खाने वाला कोई कर्मचारी नहीं मिला'
                  : 'No employees match the search criteria'
                }
              </p>
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isHindi ? 'खोज साफ़ करें' : 'Clear Search'}
                </button>
              )}
            </div>
          ) : (
            <AssessmentGrid
              employees={filteredAssignedEmployees}
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
      </div>

      {/* Info Message */}
      {filteredAssignedEmployees.length > 0 && !areReviewsLocked && (
        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            {isHindi
              ? 'आप इन कर्मचारियों का मूल्यांकन करने के लिए जिम्मेदार हैं। कृपया सभी पैरामीटर भरें और संरक्षित करें।'
              : 'You are responsible for assessing these employees. Please fill all parameters and save.'
            }
          </div>
        </div>
      )}

      {/* Changes Summary */}
      {!areReviewsLocked && filteredAssignedEmployees.length > 0 && hasEmployeeDataChanged && (
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
      {!areReviewsLocked && filteredAssignedEmployees.length > 0 && (
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={isSubmitting || !hasAssessments}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {isHindi ? 'संरक्षित हो रहा है...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isHindi ? 'मूल्यांकन संरक्षित करें' : 'Save'}
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

export default ReviewAssignedTab