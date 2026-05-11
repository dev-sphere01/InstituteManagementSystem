/**
 * ImportModePanel Component
 * 
 * Handles bulk import of employee assessments via Excel
 * Features:
 * - Excel file upload with field mapping
 * - Data preview with calculated scores
 * - Bulk submission
 * - Instructions and template download
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Save, Download } from 'lucide-react'
import { API, notification } from '@/services'
import ExcelImportService from '@/services/ExcelMappingService'
import { calculateRating, getRatingColorClass } from '../utils/ratingHelpers'

const ImportModePanel = ({
  predefinedFields,
  importedData,
  areReviewsLocked,
  onDataChange,
  onFileReset,
  onBulkSubmit,
  empID,
  calculateScoresForRow,
  isHindi = false
}) =>
{
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const notify = notification()

  // Download template function
  const downloadTemplate = async () =>
  {
    try {
      setDownloadingTemplate(true)

      // Check if empID is available
      if (!empID) {
        throw new Error('Employee ID is required for template download')
      }

      // Determine language code for API
      const language = isHindi ? 'hin' : 'eng'

      // Use the API service with proper blob handling
      const response = await API.get(`/EmpAssessments/DownloadTemplate/${empID}/${language}`, {
        responseType: 'blob'
      })

      // The response.data should be a blob when responseType is 'blob'
      const blob = response.data

      console.log('Downloaded blob size:', blob.size, 'bytes')
      console.log('Downloaded blob type:', blob.type)

      // Use the blob directly or create a new one with correct MIME type if needed
      const excelBlob = blob.type.includes('spreadsheet') || blob.type.includes('excel')
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Generate file name dynamically
      const templateFileName = isHindi
        ? 'EmployeeAssessment (Hindi).xlsx'
        : 'EmployeeAssessment.xlsx'

      // Create blob link and download (following project pattern)
      const url = window.URL.createObjectURL(excelBlob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', templateFileName)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Show success notification
      notify.success(
        isHindi
          ? 'टेम्प्लेट सफलतापूर्वक डाउनलोड किया गया'
          : 'Template downloaded successfully'
      )

    } catch (error) {
      console.error('Error downloading template:', error)

      let errorMessage
      if (!empID) {
        errorMessage = isHindi
          ? 'कर्मचारी ID उपलब्ध नहीं है। कृपया पुनः लॉगिन करें।'
          : 'Employee ID not available. Please login again.'
      } else {
        errorMessage = isHindi
          ? 'टेम्प्लेट डाउनलोड करने में त्रुटि। कृपया पुनः प्रयास करें।'
          : 'Error downloading template. Please try again.'
      }

      notify.error(errorMessage)
    } finally {
      setDownloadingTemplate(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {isHindi ? 'कर्मचारी मूल्यांकन बल्क आयात' : 'Bulk Import Employee Assessments'}
          </h2>
        </div>

        {/* Template Download Button */}
        <motion.button
          onClick={downloadTemplate}
          disabled={downloadingTemplate || !empID}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          {downloadingTemplate ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {isHindi ? 'डाउनलोड हो रहा है...' : 'Downloading...'}
            </>
          ) : !empID ? (
            <>
              <Download className="h-4 w-4" />
              {isHindi ? 'कर्मचारी ID अनुपलब्ध' : 'Employee ID Unavailable'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {isHindi ? 'टेम्प्लेट डाउनलोड करें' : 'Download Template'}
            </>
          )}
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          {isHindi ? 'निर्देश:' : 'Instructions:'}
        </h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          {isHindi ? (
            <>
              <li>ऊपर "टेम्प्लेट डाउनलोड करें" बटन का उपयोग करके टेम्प्लेट डाउनलोड करें</li>
              <li>एक्सेल फ़ाइल में कर्मचारी मूल्यांकन डेटा भरें</li>
              <li>नीचे आयात अनुभाग का उपयोग करके पूर्ण फ़ाइल अपलोड करें</li>
              <li>मैप किए गए डेटा की समीक्षा करें और सबमिट करें</li>
            </>
          ) : (
            <>
              <li>Download the template using the "Download Template" button above</li>
              <li>Fill in the employee assessment data in the Excel file</li>
              <li>Upload the completed file using the import section below</li>
              <li>Review the mapped data and submit</li>
            </>
          )}
        </ol>
      </div>

      {/* Excel Import Service */}
      <ExcelImportService
        predefinedFields={predefinedFields}
        onDataChange={onDataChange}
        onFileReset={onFileReset}
        debugMode={true}
        exportJsonEnabled={false}
        headerRow={3}
      />

      {/* Preview imported data */}
      {importedData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {isHindi
              ? `पूर्वावलोकन: ${importedData.length} रिकॉर्ड आयात के लिए तैयार`
              : `Preview: ${importedData.length} Record(s) Ready to Import`
            }
          </h3>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'कर्मचारी नं' : 'Emp No'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'नाम' : 'Name'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'स्व विकास' : 'Self Dev'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'स्टाफ विकास' : 'Staff Dev'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'निर्णय' : 'Decision'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'उत्पादकता' : 'Productivity'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'कॉल ड्यूटी' : 'Call Duty'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'उपस्थिति' : 'Attendance'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'व्यवहार' : 'Behaviour'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'ईमानदारी' : 'Integrity'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'वफादारी' : 'Loyalty'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'अंतिम %' : 'Final %'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isHindi ? 'रेटिंग' : 'Rating'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importedData.map((row, index) =>
                {
                  const scores = calculateScoresForRow(row)
                  const rating = calculateRating(scores.finalPercentage)
                  const colorClass = getRatingColorClass(rating)

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.empNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.selfDevelopment}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.employeeStaffDevelopment}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.decisionMaking}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.productivityEfficiency}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.callForDuty}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.attendancePunctuality}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.behaviourOverallDiscipline}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.integrity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.loyaltySubmissionToCompanyGoals}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">{scores.finalPercentage}%</td>
                      <td className="px-4 py-3 text-sm">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {isHindi ? (
                            rating === 'Outstanding' ? 'उत्कृष्ट' :
                              rating === 'Very Good' ? 'बहुत अच्छा' :
                                rating === 'Good' ? 'अच्छा' :
                                  rating === 'Average' ? 'औसत' :
                                    rating === 'Need Improvement' ? 'सुधार की आवश्यकता' :
                                      rating
                          ) : rating}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <motion.button
              onClick={onBulkSubmit}
              disabled={areReviewsLocked}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              {areReviewsLocked
                ? (isHindi ? 'समीक्षाएं लॉक हैं' : 'Reviews Locked')
                : (isHindi
                  ? `${importedData.length} मूल्यांकन सबमिट करें`
                  : `Submit ${importedData.length} Assessment(s)`
                )
              }
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ImportModePanel