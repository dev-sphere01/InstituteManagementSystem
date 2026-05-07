/**
 * RegularizationModal Component
 * 
 * Allows HR to regularize/edit employee performance reviews
 * Features:
 * - Editable assessment parameters
 * - Real-time score calculations
 * - Category-wise scoring
 * - Final percentage calculation
 * - Remarks editing
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { calculateRating, getRatingColorClass, getRatingInHindi } from '../utils/ratingHelpers'

const RegularizationModal = ({
  selectedReviewEmpId,
  formData,
  isSubmitting,
  onFormChange,
  onSubmit,
  onCancel,
  calculateScores
}) =>
{
  if (!selectedReviewEmpId) return null

  const scores = calculateScores()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h2 className="text-xl font-semibold text-blue-900">Regularize Review</h2>
        <p className="text-sm text-blue-700 mt-1">
          Edit the assessment values below to regularize this review
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {/* Main Header Row */}
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                Employee ID
              </th>

              {/* Performance Category */}
              <th colSpan={6} className="px-4 py-2 text-center text-sm font-semibold text-white bg-gray-800 border-r border-gray-300">
                60% - Performance
              </th>

              {/* Discipline Category */}
              <th colSpan={3} className="px-4 py-2 text-center text-sm font-semibold text-white bg-gray-800 border-r border-gray-300">
                20% - Discipline
              </th>

              {/* Integrity Category */}
              <th colSpan={3} className="px-4 py-2 text-center text-sm font-semibold text-white bg-gray-800 border-r border-gray-300">
                20% - Integrity
              </th>

              {/* Final Score */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 border-l border-gray-300">
                Final Score
              </th>

              {/* Rating */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 border-l border-gray-300 min-w-[120px]">
                Rating
              </th>

              {/* Final Remark */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-l border-gray-300 min-w-[200px]">
                Final Remark
              </th>
            </tr>

            {/* Sub-header row for individual parameters */}
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-r border-gray-200"></th>

              {/* Performance Parameters */}
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Self Dev
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Staff Dev
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Decision
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Productivity
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Call Duty
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 bg-gray-200">
                Score
              </th>

              {/* Discipline Parameters */}
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Attendance
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Behaviour
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 bg-gray-200">
                Score
              </th>

              {/* Integrity Parameters */}
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Integrity
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[100px]">
                Loyalty
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 bg-gray-200">
                Score
              </th>

              {/* Final Score */}
              <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-green-100 border-l border-gray-300">
                %
              </th>

              {/* Rating */}
              <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-purple-100 border-l border-gray-300">
                Rating
              </th>

              {/* Final Remark */}
              <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-yellow-100 border-l border-gray-300">
                Remark
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            <tr className="bg-white">
              {/* Employee Info */}
              <td className="px-4 py-3 border-r border-gray-200">
                <div className="flex flex-col">
                  <div className="font-medium text-gray-900">
                    {selectedReviewEmpId}
                  </div>
                </div>
              </td>

              {/* Performance Parameters */}
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.SelfDevelopment}
                  onChange={(e) => onFormChange('SelfDevelopment', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.EmployeeStaffDevelopment}
                  onChange={(e) => onFormChange('EmployeeStaffDevelopment', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.DecisionMaking}
                  onChange={(e) => onFormChange('DecisionMaking', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.ProductivityEfficiency}
                  onChange={(e) => onFormChange('ProductivityEfficiency', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.CallForDuty}
                  onChange={(e) => onFormChange('CallForDuty', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 text-center border-r border-gray-300 bg-gray-50">
                <div className="font-semibold text-blue-600">
                  {scores.performanceScore}
                </div>
              </td>

              {/* Discipline Parameters */}
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.AttendancePunctuality}
                  onChange={(e) => onFormChange('AttendancePunctuality', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.BehaviourOverallDiscipline}
                  onChange={(e) => onFormChange('BehaviourOverallDiscipline', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 text-center border-r border-gray-300 bg-gray-50">
                <div className="font-semibold text-orange-600">
                  {scores.disciplineScore}
                </div>
              </td>

              {/* Integrity Parameters */}
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.Integrity}
                  onChange={(e) => onFormChange('Integrity', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 border-r border-gray-200">
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.LoyaltySubmissionToCompanyGoals}
                  onChange={(e) => onFormChange('LoyaltySubmissionToCompanyGoals', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-400 focus:border-transparent text-center"
                />
              </td>
              <td className="px-2 py-3 text-center border-r border-gray-300 bg-gray-50">
                <div className="font-semibold text-purple-600">
                  {scores.integrityScore}
                </div>
              </td>

              {/* Final Score */}
              <td className="px-4 py-3 text-center bg-green-50 border-l border-gray-300">
                <div className="font-bold text-green-600 text-lg">
                  {scores.finalPercentage}%
                </div>
              </td>

              {/* Rating */}
              <td className="px-4 py-3 text-center bg-purple-50 border-l border-gray-300">
                {(() =>
                {
                  const rating = calculateRating(scores.finalPercentage) // Show English rating when not submitting
                  const displayRating = getRatingInHindi(rating) // Always show Hindi in regularization modal
                  const colorClass = getRatingColorClass(rating)

                  return (
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                      {rating}
                    </div>
                  )
                })()}
              </td>

              {/* Final Remark */}
              <td className="px-4 py-3 bg-yellow-50 border-l border-gray-300">
                <textarea
                  value={formData.FinalRemark}
                  onChange={(e) => onFormChange('FinalRemark', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows="2"
                  placeholder="Enter final remarks..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-gray-200 bg-blue-50">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <motion.button
            onClick={onSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isSubmitting
              ? 'bg-blue-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default RegularizationModal