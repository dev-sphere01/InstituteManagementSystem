/**
 * ReviewDetailModal Component
 * 
 * Displays detailed view of a single performance review
 * Features:
 * - Review submission date and period
 * - Final performance score
 * - Category-wise parameter breakdown
 * - Individual scores for all parameters
 */

import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { calculateRating, getRatingColorClass, getRatingInHindi } from '../utils/ratingHelpers'

const ReviewDetailModal = ({ review, onClose }) => {
  if (!review) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-100 rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
    >
      {/* Close Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Review Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        {/* Review Date and Final Score */}
        <div className="pb-2 border-b border-gray-200 grid grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Submitted On</div>
            <div className="font-medium text-gray-800">
              {new Date(review.SubmittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {review.Month}/{review.Year}
            </div>
          </div>
          
          {/* Final Score and Rating */}
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-2 border border-green-200 grid grid-cols-2 items-center">
              <div className="text-4xl font-bold text-green-600 text-center">
                {review.FinalPercentage}%
              </div>
              <div className="text-sm text-gray-600 ms-2 leading-tight text-left">
                Final <br /> Performance <br /> Score
              </div>
            </div>
            
            {/* Rating Display */}
            <div className="text-center">
              {(() => {
                const rating = review.Rating || calculateRating(review.FinalPercentage)
                const colorClass = getRatingColorClass(rating)
                
                return (
                  <div className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${colorClass}`}>
                    {rating}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Performance Parameters */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Performance (60%)</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Self Development</div>
              <div className="font-semibold text-gray-800">{review.SelfDevelopment}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Staff Development</div>
              <div className="font-semibold text-gray-800">{review.EmployeeStaffDevelopment}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Decision Making</div>
              <div className="font-semibold text-gray-800">{review.DecisionMaking}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Productivity</div>
              <div className="font-semibold text-gray-800">{review.ProductivityEfficiency}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Call for Duty</div>
              <div className="font-semibold text-gray-800">{review.CallForDuty}/4</div>
            </div>
            <div className="bg-blue-100 p-2 border-gray-300 rounded border">
              <div className="text-blue-700 text-xs font-medium">Score</div>
              <div className="font-bold text-blue-800">{review.PerformanceScore}</div>
            </div>
          </div>
        </div>

        {/* Discipline Parameters */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Discipline (20%)</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Attendance</div>
              <div className="font-semibold text-gray-800">{review.AttendancePunctuality}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Behaviour</div>
              <div className="font-semibold text-gray-800">{review.BehaviourOverallDiscipline}/4</div>
            </div>
            <div className="bg-orange-100 p-2 border-gray-300 rounded border">
              <div className="text-orange-700 text-xs font-medium">Score</div>
              <div className="font-bold text-orange-800">{review.DisciplineScore}</div>
            </div>
          </div>
        </div>

        {/* Integrity Parameters */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Integrity (20%)</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Integrity</div>
              <div className="font-semibold text-gray-800">{review.Integrity}/4</div>
            </div>
            <div className="bg-gray-50 p-2 border-gray-300 rounded border">
              <div className="text-gray-600 text-xs">Loyalty</div>
              <div className="font-semibold text-gray-800">{review.LoyaltySubmissionToCompanyGoals}/4</div>
            </div>
            <div className="bg-purple-100 p-2 border-gray-300 rounded border">
              <div className="text-purple-700 text-xs font-medium">Score</div>
              <div className="font-bold text-purple-800">{review.IntegrityScore}</div>
            </div>
          </div>
        </div>

        {/* Final Remark */}
        {review.FinalRemark && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 text-sm uppercase">Final Remark</h3>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-gray-800">{review.FinalRemark}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ReviewDetailModal