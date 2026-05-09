import { useState, useEffect } from 'react'
import { API, notification } from '@/services'

/**
 * Custom hook to manage review parameters and categories
 */
export const useReviewParameters = () => {
  const notify = notification()
  const [reviewParameters, setReviewParameters] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingParameters, setLoadingParameters] = useState(false)

  const loadReviewParameters = async () => {
    setLoadingParameters(true)
    try {
      const response = await API.get('/ReviewParameters')
      const parameters = Array.isArray(response.data) ? response.data : []
      setReviewParameters(parameters)

      // Extract unique categories
      const categoryMap = new Map()
      parameters.forEach(p => {
        if (!categoryMap.has(p.CategoryID)) {
          categoryMap.set(p.CategoryID, {
            id: p.CategoryID,
            name: p.Category,
            nameHindi: p.CategoryHindi
          })
        }
      })
      const uniqueCategories = Array.from(categoryMap.values())
      setCategories(uniqueCategories)

    } catch (error) {
      console.error('Failed to load review parameters:', error)
      notify.error('Failed to load review parameters')
    } finally {
      setLoadingParameters(false)
    }
  }

  useEffect(() => {
    loadReviewParameters()
  }, [])

  return {
    reviewParameters,
    categories,
    loadingParameters,
    reloadParameters: loadReviewParameters
  }
}

export default useReviewParameters