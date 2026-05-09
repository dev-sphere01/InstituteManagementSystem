/**
 * AssessmentGrid Component
 * 
 * Displays a comprehensive grid for employee performance assessments
 * Features:
 * - Employee rows with assessment parameters
 * - Category-grouped parameters with scores
 * - Real-time score calculations
 * - Final percentage and remarks
 * - Locked/unlocked state handling
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { calculateRating, getRatingColorClass, getRatingInHindi } from '../utils/ratingHelpers'

const AssessmentGrid = ({
  employees,
  categories,
  reviewParameters,
  assessmentData,
  finalRemarks,
  isHindi,
  areReviewsLocked,
  onAssessmentChange,
  onFinalRemarkChange,
  calculateCategoryScore,
  calculateFinalPercentage,
  getCategoryWeightage,
  hasEmployeeDataChanged, // Optional: function to check if employee data has changed
  showChangeIndicators = false // Optional: whether to show change indicators
}) =>
{
  if (!employees || employees.length === 0) {
    return null
  }

  return (
    <div className="relative max-h-[50vh] overflow-auto shadow-sm">
      <table className="min-w-full ">
        <thead className="sticky top-0 z-20">
          {/* Main Header Row - Categories */}
          <tr className="bg-gray-50">
            {/* Employee Column Header */}
            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px] z-10">
              Employee
            </th>

            {/* Parameter Column Headers grouped by category */}
            {categories.map((category) =>
            {
              const categoryParams = reviewParameters.filter(p => p.CategoryID === category.id)
              return (
                <th
                  key={category.id}
                  colSpan={categoryParams.length + 1}
                  className="px-4 py-2 text-center text-sm font-semibold text-white bg-gray-800 border-r border-gray-300"
                >
                  {getCategoryWeightage(category.id, reviewParameters)}% - {isHindi ? category.nameHindi : category.name}
                </th>
              )
            })}

            {/* Final Score Column */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 border-l border-gray-300">
              Final Score
            </th>

            {/* Rating Column */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 border-l border-gray-300 min-w-[120px]">
              Rating
            </th>

            {/* Final Remark Column */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50 border-l border-gray-300 min-w-[200px]">
              Final Remark
            </th>
          </tr>

          {/* Sub-header row for individual parameters */}
          <tr className="bg-gray-100">
            <th className="sticky left-0 bg-gray-100 px-4 py-2 border-r border-gray-200 z-10"></th>

            {categories.map((category) =>
            {
              const categoryParams = reviewParameters.filter(p => p.CategoryID === category.id)
              return (
                <React.Fragment key={`sub-${category.id}`}>
                  {categoryParams.map((param) => (
                    <th
                      key={param.ReviewParameterID}
                      className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-200 min-w-[120px]"
                      title={isHindi ? param.ParameterNameHindi : param.ParameterName}
                    >
                      <div className="truncate">
                        {isHindi ? param.ParameterNameHindi : param.ParameterName}
                      </div>
                    </th>
                  ))}
                  {/* Category Score Column */}
                  <th className="px-2 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 bg-gray-200">
                    Score
                  </th>
                </React.Fragment>
              )
            })}

            <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-green-100 border-l border-gray-300">
              %
            </th>

            <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-purple-100 border-l border-gray-300">
              Rating
            </th>

            <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center bg-yellow-100 border-l border-gray-300">
              Remark
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee, empIndex) =>
          {
            const hasChanges = showChangeIndicators && hasEmployeeDataChanged && hasEmployeeDataChanged(employee.EmpID)
            const rowBgClass = hasChanges
              ? 'bg-blue-50 border-l-4 border-l-blue-500'
              : (empIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')

            return (
              <tr key={employee.EmpID} className={rowBgClass}>
                {/* Employee Info Column */}
                <td className="sticky left-0 bg-inherit px-4 py-3 border-r border-gray-200 z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">
                        {employee.FirstName} {employee.LastName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {employee.EmpID}</div>
                    </div>
                    {hasChanges && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title={isHindi ? 'बदलाव हैं' : 'Has changes'}></div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Parameter Columns grouped by category */}
                {categories.map((category) =>
                {
                  const categoryParams = reviewParameters.filter(p => p.CategoryID === category.id)
                  return (
                    <React.Fragment key={`emp-${employee.EmpID}-cat-${category.id}`}>
                      {categoryParams.map((param) =>
                      {
                        const key = `${employee.EmpID}_${param.ReviewParameterID}`
                        const currentValue = assessmentData[key] || 0
                        const options = isHindi ? param.OptionsHindi : param.OptionsEnglish

                        return (
                          <td key={param.ReviewParameterID} className="px-2 py-3 border-r border-gray-200">
                            <select
                              value={String(currentValue)}
                              onChange={(e) => onAssessmentChange(employee.EmpID, param.ReviewParameterID, e.target.value)}
                              disabled={areReviewsLocked}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                            >
                              <option value="0">Select...</option>
                              {options.map((option, index) => (
                                <option key={index} value={String(index + 1)}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                        )
                      })}

                      {/* Category Score Display */}
                      <td className="px-2 py-3 text-center border-r border-gray-300 bg-gray-50">
                        <div className="font-semibold text-gray-800">
                          {calculateCategoryScore(employee.EmpID, category.id).toFixed(1)}
                        </div>
                      </td>
                    </React.Fragment>
                  )
                })}

                {/* Final Score Column */}
                <td className="px-4 py-3 text-center bg-green-50 border-l border-gray-300">
                  <div className="font-bold text-green-600 text-lg">
                    {calculateFinalPercentage(employee.EmpID).toFixed(1)}%
                  </div>
                </td>

                {/* Rating Column */}
                <td className="px-4 py-3 text-center bg-purple-50 border-l border-gray-300">
                  {(() => {
                    const percentage = calculateFinalPercentage(employee.EmpID)
                    const rating = calculateRating(percentage)
                    const displayRating = isHindi ? getRatingInHindi(rating) : rating
                    const colorClass = getRatingColorClass(rating)
                    
                    return (
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {displayRating}
                      </div>
                    )
                  })()}
                </td>

                {/* Final Remark Column */}
                <td className="px-4 py-3 bg-yellow-50 border-l border-gray-300">
                  <textarea
                    value={finalRemarks[employee.EmpID] || ''}
                    onChange={(e) => onFinalRemarkChange(employee.EmpID, e.target.value)}
                    disabled={areReviewsLocked}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    rows="2"
                    placeholder="Enter final remarks..."
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AssessmentGrid