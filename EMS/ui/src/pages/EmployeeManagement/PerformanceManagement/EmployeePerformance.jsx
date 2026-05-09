import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, ChevronDown, Users, Lock, Languages, CheckCircle, Clock, ListChecks } from 'lucide-react'

//role wise form components imports
import EmpSideForm from './components/EmpSideForm'
import HrSideForm from './components/HrSideForm/index'
import useEmpDataStore from '@/store/empDataStore'
import { notification, API } from '@/services'

const EmployeePerformance = () =>
{
  const notify = notification()

  const {
    currentEmployee,
    getEmployeeDisplayName
  } = useEmpDataStore()

  // Translation helper function - returns Hindi text if isHindi is true, otherwise English
  const t = (englishText, hindiText) => isHindi ? hindiText : englishText

  // Session management states
  const [reviewSessions, setReviewSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Lock reviews states
  const [isLockingReviews, setIsLockingReviews] = useState(false)
  const [areReviewsLocked, setAreReviewsLocked] = useState(false)

  // Stats states
  const [reviewStats, setReviewStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Language state
  const [isHindi, setIsHindi] = useState(false)

  // Department state
  const [employeeDeptID, setEmployeeDeptID] = useState(null)

  // Filter state for Overall stats
  const [overallFilter, setOverallFilter] = useState(null) // null, 'assessed', or 'remaining'

  const roleID = currentEmployee?.RoleID || 1

  // Load review sessions
  const loadReviewSessions = async () =>
  {
    setLoadingSessions(true)
    try {
      const response = await API.get('/ReviewSessions')
      const sessions = Array.isArray(response.data) ? response.data : []
      setReviewSessions(sessions)
    } catch (error) {
      console.error('Failed to load review sessions:', error)
      notify.error(t('Failed to load review sessions', 'समीक्षा सत्र लोड करने में विफल'))
    } finally {
      setLoadingSessions(false)
    }
  }

  // Load reviewer stats
  const loadReviewerStats = async (empId, sessionId) =>
  {
    if (!empId || !sessionId) return

    setLoadingStats(true)
    try {
      const response = await API.get(`/EmpAssessments/StatsforReviewer/${empId}/${sessionId}`)
      setReviewStats(response.data)
    } catch (error) {
      console.error('Failed to load reviewer stats:', error)
      // Don't show error notification as stats are supplementary
    } finally {
      setLoadingStats(false)
    }
  }

  // Update lock status and load stats when session changes
  useEffect(() =>
  {
    if (selectedSessionId && reviewSessions.length > 0) {
      const selectedSession = reviewSessions.find(s => s.ReviewSessionID === parseInt(selectedSessionId))
      if (selectedSession && selectedSession.IsLocked !== undefined) {
        setAreReviewsLocked(selectedSession.IsLocked)
      } else {
        setAreReviewsLocked(false)
      }

      // Load stats for the selected session
      if (currentEmployee?.EmpID) {
        loadReviewerStats(currentEmployee.EmpID, selectedSessionId)
      }
    } else {
      setAreReviewsLocked(false)
      setReviewStats(null)
    }
  }, [selectedSessionId, reviewSessions, currentEmployee?.EmpID])

  // Load sessions on component mount
  useEffect(() =>
  {
    loadReviewSessions()
  }, [])

  // Load employee department
  useEffect(() =>
  {
    const loadEmployeeDepartment = async () =>
    {
      if (currentEmployee?.EmpID) {
        try {
          const response = await API.get(`/EmpDeptPos/${currentEmployee.EmpID}`)
          if (response.data && response.data.DeptID) {
            setEmployeeDeptID(response.data.DeptID)
          }
        } catch (error) {
          console.error('Failed to load employee department:', error)
        }
      }
    }

    loadEmployeeDepartment()
  }, [currentEmployee?.EmpID])

  // Handle lock reviews
  const handleLockReviews = async () =>
  {
    if (!selectedSessionId) {
      return notify.error(t('Please select a session first', 'कृपया पहले एक सत्र चुनें'))
    }

    setIsLockingReviews(true)
    try {
      await API.post(`/EmpAssessments/LockReviewsbySession/${selectedSessionId}`)
      notify.success(t('Reviews locked successfully for this session!', 'इस सत्र के लिए समीक्षा सफलतापूर्वक लॉक की गई!'))
      setAreReviewsLocked(true)
    } catch (error) {
      console.error('Failed to lock reviews:', error)
      notify.error(t('Failed to lock reviews', 'समीक्षा लॉक करने में विफल'))
    } finally {
      setIsLockingReviews(false)
    }
  }



  return (
    <div className="p-0 ">
      {/* Header with Session Selection */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className=" rounded-xl shadow-lg  p-6 border border-gray-100"
      >
        {/* Top Row: Title, Stats, Session Dropdown, Language Toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              {t('Performance Appraisal', 'प्रदर्शन मूल्यांकन')}
            </h1>

            {/* Compact Overall Stats Display - Now as Filter Buttons */}
            {selectedSessionId && reviewStats && reviewStats.Overall.TotalEmployees > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 ml-4"
              >
                {/* Total - Display only, not clickable */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-md border border-blue-200">
                  <ListChecks className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {t('Total:', 'कुल:')}
                  </span>
                  <span className="text-sm font-bold text-blue-900">{reviewStats.Overall.TotalEmployees}</span>
                </div>

                {/* Assessed - Display only */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    {t('Assessed:', 'मूल्यांकित:')}
                  </span>
                  <span className="text-sm font-bold text-green-900">
                    {reviewStats.Overall.Completed}
                  </span>
                </div>

                {/* To be Assessed - Display only */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-md border border-orange-200">
                  <Clock className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">
                    {t('To be Assessed:', 'मूल्यांकन होना है:')}
                  </span>
                  <span className="text-sm font-bold text-orange-900">
                    {reviewStats.Overall.Remaining}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side: Session Dropdown, Lock Button, Language Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Session Dropdown */}
            <div className="relative">
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={loadingSessions}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 appearance-none text-sm font-medium"
              >
                <option value="">
                  {loadingSessions
                    ? t('Loading...', 'लोड हो रहा है...')
                    : t('Select Session', 'सत्र चुनें')
                  }
                </option>
                {reviewSessions.map((session) => (
                  <option key={session.ReviewSessionID} value={session.ReviewSessionID}>
                    {session.SessionName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Lock Reviews Button - Only visible to DeptID 10 employees */}
            {selectedSessionId && roleID === 1 && employeeDeptID === 10 && (
              <div className="flex items-center gap-2">
                {areReviewsLocked && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {t('Locked', 'लॉक किया गया')}
                    </span>
                  </div>
                )}
                <motion.button
                  onClick={handleLockReviews}
                  disabled={areReviewsLocked || isLockingReviews}
                  whileHover={!areReviewsLocked && !isLockingReviews ? { scale: 1.02 } : {}}
                  whileTap={!areReviewsLocked && !isLockingReviews ? { scale: 0.98 } : {}}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${areReviewsLocked || isLockingReviews
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  <Lock className="h-4 w-4" />
                  {isLockingReviews
                    ? t('Locking...', 'लॉक हो रहा है...')
                    : areReviewsLocked
                      ? t('Locked', 'लॉक किया गया')
                      : t('Lock Reviews', 'समीक्षा लॉक करें')
                  }
                </motion.button>
              </div>
            )}

            {/* Language Toggle */}
            <motion.button
              onClick={() => setIsHindi(!isHindi)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${isHindi
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
                }`}
            >
              <Languages className="h-4 w-4" />
              {isHindi ? 'हिंदी' : 'English'}
            </motion.button>
          </div>
        </div>

        {/* Warning Message */}
        {!selectedSessionId && reviewSessions.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              {t(
                'Please select a review session to begin performance assessments.',
                'प्रदर्शन मूल्यांकन शुरू करने के लिए कृपया एक समीक्षा सत्र चुनें।'
              )}
            </p>
          </div>
        )}
        {/* Role-based Form Components */}
        <div className='mt-3'>
          {roleID === 1 ? (
            <HrSideForm
              selectedSessionId={selectedSessionId}
              reviewSessions={reviewSessions}
              loadingSessions={loadingSessions}
              areReviewsLocked={areReviewsLocked}
              setAreReviewsLocked={setAreReviewsLocked}
              isHindi={isHindi}
              setIsHindi={setIsHindi}
              reviewStats={reviewStats}
              loadingStats={loadingStats}
              overallFilter={overallFilter}
            />
          ) : (
            <EmpSideForm
              selectedSessionId={selectedSessionId}
              reviewSessions={reviewSessions}
              loadingSessions={loadingSessions}
            />
          )}
        </div>
      </motion.div>

    </div>
  )
}

export default EmployeePerformance