/**
 * RandomAssessmentTab Component
 * 
 * Tab for assigning random assessments to employees
 * Features:
 * - Assessor selection (single employee who will do the assessment)
 * - Assessee selection (multiple employees to be assessed)
 * - Search and filter functionality for both
 * - Form submission with validation
 */

import React from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Users, Send, AlertCircle } from 'lucide-react'

const RandomAssessmentTab = ({
  // Hook state
  assessorSearch,
  assesseeSearch,
  selectedAssessor,
  selectedAssessees,
  filteredAssessors,
  filteredAssessees,
  showAssessorDropdown,
  showAssesseeDropdown,
  assessorDropdownRef,
  assesseeDropdownRef,
  isSubmitting,

  // Hook handlers (using actual names from useRandomAssessment hook)
  setAssessorSearch,
  setAssesseeSearch,
  handleAssessorSelect,
  handleAssesseeToggle,
  setShowAssessorDropdown,
  setShowAssesseeDropdown,
  handleSubmit,

  // Props
  isHindi,
  areReviewsLocked
}) =>
{
  // Create dropdown toggle handlers
  const handleAssessorDropdownToggle = () =>
  {
    setShowAssessorDropdown(!showAssessorDropdown)
  }

  const handleAssesseeDropdownToggle = () =>
  {
    setShowAssesseeDropdown(!showAssesseeDropdown)
  }

  // Validation
  const canSubmit = selectedAssessor && selectedAssessees.length > 0 && !isSubmitting && !areReviewsLocked

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {isHindi ? 'रैंडम मूल्यांकन असाइन करें' : 'Assign Random Assessment'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {isHindi
            ? 'एक मूल्यांकनकर्ता चुनें और कर्मचारियों को असाइन करें'
            : 'Select an assessor and assign employees for assessment'
          }
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Assessor Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} />
            {isHindi ? 'मूल्यांकनकर्ता चुनें' : 'Select Assessor'}
            <span className="text-red-500">*</span>
          </label>

          <div className="relative" ref={assessorDropdownRef}>
            <button
              onClick={handleAssessorDropdownToggle}
              disabled={areReviewsLocked}
              className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            >
              {selectedAssessor ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedAssessor.FirstName} {selectedAssessor.LastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {selectedAssessor.EmpID}
                    </div>
                  </div>
                  <UserCheck size={18} className="text-blue-600" />
                </div>
              ) : (
                <span className="text-gray-400">
                  {isHindi ? 'मूल्यांकनकर्ता चुनें...' : 'Select assessor...'}
                </span>
              )}
            </button>

            {showAssessorDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={assessorSearch}
                    onChange={(e) => setAssessorSearch(e.target.value)}
                    placeholder={isHindi ? 'मूल्यांकनकर्ता खोजें...' : 'Search assessor...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredAssessors.length > 0 ? (
                    filteredAssessors.map((employee) => (
                      <button
                        key={employee.EmpID}
                        onClick={() => handleAssessorSelect(employee)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {employee.FirstName} {employee.LastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.EmpID} {employee.WorkEmail && `• ${employee.WorkEmail}`}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      {isHindi ? 'कोई कर्मचारी नहीं मिला' : 'No employees found'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessee Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users size={16} />
            {isHindi ? 'मूल्यांकन के लिए कर्मचारी चुनें' : 'Select Employees to Assess'}
            <span className="text-red-500">*</span>
          </label>

          <div className="relative" ref={assesseeDropdownRef}>
            <button
              onClick={handleAssesseeDropdownToggle}
              disabled={areReviewsLocked}
              className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            >
              {selectedAssessees.length > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedAssessees.length} {isHindi ? 'कर्मचारी चयनित' : 'employees selected'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isHindi ? 'विवरण देखने के लिए क्लिक करें' : 'Click to view details'}
                    </div>
                  </div>
                  <Users size={18} className="text-blue-600" />
                </div>
              ) : (
                <span className="text-gray-400">
                  {isHindi ? 'कर्मचारी चुनें...' : 'Select employees...'}
                </span>
              )}
            </button>

            {showAssesseeDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={assesseeSearch}
                    onChange={(e) => setAssesseeSearch(e.target.value)}
                    placeholder={isHindi ? 'कर्मचारी खोजें...' : 'Search employees...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredAssessees.length > 0 ? (
                    filteredAssessees.map((employee) =>
                    {
                      const isSelected = selectedAssessees.some(emp => emp.EmpID === employee.EmpID)
                      return (
                        <button
                          key={employee.EmpID}
                          onClick={() => handleAssesseeToggle(employee)}
                          className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${isSelected
                              ? 'bg-blue-100 hover:bg-blue-200'
                              : 'hover:bg-blue-50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => { }} // Handled by parent onClick
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {employee.FirstName} {employee.LastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {employee.EmpID} {employee.WorkEmail && `• ${employee.WorkEmail}`}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      {isHindi ? 'कोई कर्मचारी नहीं मिला' : 'No employees found'}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowAssesseeDropdown(false)}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {isHindi ? `चयनित (${selectedAssessees.length})` : `Selected (${selectedAssessees.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Assessees Display */}
          {selectedAssessees.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-2">
                {isHindi ? 'चयनित कर्मचारी:' : 'Selected Employees:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAssessees.map((employee) => (
                  <div
                    key={employee.EmpID}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm border border-blue-300"
                  >
                    <span className="font-medium text-gray-900">
                      {employee.FirstName} {employee.LastName}
                    </span>
                    <span className="text-gray-500">({employee.EmpID})</span>
                    {!areReviewsLocked && (
                      <button
                        onClick={() => handleAssesseeToggle(employee)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation Message */}
        {!canSubmit && !areReviewsLocked && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              {!selectedAssessor && (
                <div>{isHindi ? '• कृपया एक मूल्यांकनकर्ता चुनें' : '• Please select an assessor'}</div>
              )}
              {selectedAssessees.length === 0 && (
                <div>{isHindi ? '• कृपया कम से कम एक कर्मचारी चुनें' : '• Please select at least one employee'}</div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: canSubmit ? 1.02 : 1 }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {isHindi ? 'असाइन हो रहा है...' : 'Assigning...'}
              </>
            ) : (
              <>
                <Send size={18} />
                {isHindi ? 'असाइन करें' : 'Assign Assessment'}
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Locked State Message */}
      {areReviewsLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            {isHindi
              ? '⚠️ समीक्षाएं लॉक हैं। नए असाइनमेंट नहीं किए जा सकते।'
              : '⚠️ Reviews are locked. No new assignments can be made.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default RandomAssessmentTab