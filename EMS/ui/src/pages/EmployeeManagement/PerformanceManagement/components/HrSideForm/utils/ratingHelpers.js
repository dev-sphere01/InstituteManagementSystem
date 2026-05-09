/**
 * Rating calculation utilities
 * 
 * Calculates performance ratings based on final percentage scores
 */

/**
 * Calculate rating based on percentage score
 * @param {number} percentage - The final percentage score
 * @returns {string} - The rating text
 */
export const calculateRating = (percentage) => {
  // If percentage is 0, it means no assessment was done
  if (percentage === 0) {
    return 'NA'
  } else if (percentage >= 91) {
    return 'Outstanding'
  } else if (percentage >= 81) {
    return 'Very Good'
  } else if (percentage >= 60) {
    return 'Good'
  } else if (percentage >= 50) {
    return 'Average'
  } else {
    return 'Need Improvement'
  }
}

/**
 * Get rating color class for UI display
 * @param {string} rating - The rating text
 * @returns {string} - CSS color class
 */
export const getRatingColorClass = (rating) => {
  switch (rating) {
    case 'Outstanding':
      return 'text-green-700 bg-green-100'
    case 'Very Good':
      return 'text-blue-700 bg-blue-100'
    case 'Good':
      return 'text-yellow-700 bg-yellow-100'
    case 'Average':
      return 'text-orange-700 bg-orange-100'
    case 'Need Improvement':
      return 'text-red-700 bg-red-100'
    case 'NA':
      return 'text-gray-700 bg-gray-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}

/**
 * Get rating in Hindi
 * @param {string} rating - The rating text in English
 * @returns {string} - The rating text in Hindi
 */
export const getRatingInHindi = (rating) => {
  switch (rating) {
    case 'Outstanding':
      return 'उत्कृष्ट'
    case 'Very Good':
      return 'बहुत अच्छा'
    case 'Good':
      return 'अच्छा'
    case 'Average':
      return 'औसत'
    case 'Need Improvement':
      return 'सुधार की आवश्यकता'
    case 'NA':
      return 'लागू नहीं'
    default:
      return rating
  }
}