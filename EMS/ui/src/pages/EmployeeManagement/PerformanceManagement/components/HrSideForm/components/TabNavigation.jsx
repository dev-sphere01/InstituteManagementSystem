import React from 'react'

const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabs,
  isHindi,
  showRandomAssessmentTab, 
  showReviewAssignedTab, 
  showViewAllReviewsTab 
}) => {
  
  // Debug: Log tab navigation props
  console.log('📋 TabNavigation Props:', {
    activeTab,
    showRandomAssessmentTab,
    showReviewAssignedTab,
    showViewAllReviewsTab
  })
  const getTabDescription = () => {
    switch (activeTab) {
      case 'assessment':
        return isHindi 
          ? 'ग्रिड प्रारूप में सभी कर्मचारियों के लिए प्रदर्शन मूल्यांकन पूरा करें। विभिन्न पैरामीटर पर कर्मचारियों को रेट करें।'
          : 'Complete performance evaluations for all employees in a grid format. Rate employees on various parameters.'
      case 'random':
        return isHindi
          ? 'एक मूल्यांकनकर्ता और मूल्यांकन किए जाने वाले व्यक्तियों का चयन करके यादृच्छिक मूल्यांकन असाइन करें।'
          : 'Assign random assessments by selecting an assessor and assessees.'
      case 'assigned':
        return isHindi
          ? 'आपको असाइन किए गए कर्मचारियों की समीक्षा और मूल्यांकन करें।'
          : 'Review and assess employees assigned to you.'
      case 'viewAll':
        return isHindi
          ? 'किसी भी कर्मचारी के लिए सभी प्रदर्शन समीक्षाएं देखें।'
          : 'View all performance reviews for any employee.'
      default:
        return ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
      <p className="text-gray-600 mb-4">{getTabDescription()}</p>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => onTabChange('assessment')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'assessment'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          {isHindi ? 'प्रदर्शन मूल्यांकन' : 'Performance Assessment'}
        </button>
        
        {showRandomAssessmentTab && (
          <button
            onClick={() => onTabChange('random')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'random'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {isHindi ? 'अतिरिक्त मूल्यांकन असाइन करें' : 'Assign Additional Assessment'}
          </button>
        )}
        
        {showReviewAssignedTab && (
          <button
            onClick={() => onTabChange('assigned')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'assigned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {isHindi ? 'असाइन किए गए कर्मचारियों का मूल्यांकन' : 'Assess Assigned Employees'}
          </button>
        )}
        
        {showViewAllReviewsTab && (
          <button
            onClick={() => onTabChange('viewAll')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'viewAll'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {isHindi ? 'सभी समीक्षाएं देखें' : 'View All Reviews'}
          </button>
        )}
      </div>
    </div>
  )
}

export default TabNavigation