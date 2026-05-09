/**
 * useRandomAssessment Hook
 * 
 * Manages random assessment assignment functionality including:
 * - Assessor selection (single)
 * - Assessee selection (multiple)
 * - Search and filtering for both
 * - Dropdown visibility management
 * - Form submission
 */

import { useState, useEffect, useRef } from 'react'
import { API, notification } from '@/services'

export const useRandomAssessment = (selectedSessionId, allEmployees) => {
  const notify = notification()

  // State management
  const [selectedAssessor, setSelectedAssessor] = useState(null)
  const [selectedAssessees, setSelectedAssessees] = useState([])
  const [assessorSearch, setAssessorSearch] = useState('')
  const [assesseeSearch, setAssesseeSearch] = useState('')
  const [showAssessorDropdown, setShowAssessorDropdown] = useState(false)
  const [showAssesseeDropdown, setShowAssesseeDropdown] = useState(false)
  const [filteredAssessors, setFilteredAssessors] = useState([])
  const [filteredAssessees, setFilteredAssessees] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for dropdown management
  const assessorDropdownRef = useRef(null)
  const assesseeDropdownRef = useRef(null)
  const assessorInputRef = useRef(null)
  const assesseeInputRef = useRef(null)

  // Filter assessors based on search
  useEffect(() => {
    if (!assessorSearch.trim()) {
      setFilteredAssessors(allEmployees)
      return
    }

    const searchLower = assessorSearch.toLowerCase()
    const filtered = allEmployees.filter(emp => {
      const fullName = `${emp.FirstName} ${emp.LastName}`.toLowerCase()
      const empId = emp.EmpID?.toString().toLowerCase() || ''
      const email = emp.WorkEmail?.toLowerCase() || ''
      
      return fullName.includes(searchLower) || 
             empId.includes(searchLower) || 
             email.includes(searchLower)
    })
    
    setFilteredAssessors(filtered)
  }, [assessorSearch, allEmployees])

  // Filter assessees based on search
  useEffect(() => {
    if (!assesseeSearch.trim()) {
      setFilteredAssessees(allEmployees)
      return
    }

    const searchLower = assesseeSearch.toLowerCase()
    const filtered = allEmployees.filter(emp => {
      const fullName = `${emp.FirstName} ${emp.LastName}`.toLowerCase()
      const empId = emp.EmpID?.toString().toLowerCase() || ''
      const email = emp.WorkEmail?.toLowerCase() || ''
      
      return fullName.includes(searchLower) || 
             empId.includes(searchLower) || 
             email.includes(searchLower)
    })
    
    setFilteredAssessees(filtered)
  }, [assesseeSearch, allEmployees])

  // Handle click outside and keyboard events to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assessorDropdownRef.current && !assessorDropdownRef.current.contains(event.target)) {
        setShowAssessorDropdown(false)
      }
      if (assesseeDropdownRef.current && !assesseeDropdownRef.current.contains(event.target)) {
        setShowAssesseeDropdown(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAssessorDropdown(false)
        setShowAssesseeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Handle assessor selection
  const handleAssessorSelect = (employee) => {
    setSelectedAssessor(employee)
    setAssessorSearch(`${employee.FirstName} ${employee.LastName} (${employee.EmpID})`)
    setShowAssessorDropdown(false)
  }

  // Handle assessee toggle (multi-select)
  const handleAssesseeToggle = (employee) => {
    const isSelected = selectedAssessees.some(emp => emp.EmpID === employee.EmpID)
    if (isSelected) {
      setSelectedAssessees(selectedAssessees.filter(emp => emp.EmpID !== employee.EmpID))
    } else {
      setSelectedAssessees([...selectedAssessees, employee])
    }
  }

  // Handle remove single assessee
  const handleRemoveAssessee = (empId) => {
    setSelectedAssessees(selectedAssessees.filter(emp => emp.EmpID !== empId))
  }

  // Clear all assessees
  const clearAllAssessees = () => {
    setSelectedAssessees([])
  }

  // Reset form
  const resetForm = () => {
    setSelectedAssessor(null)
    setSelectedAssessees([])
    setAssessorSearch('')
    setAssesseeSearch('')
    setShowAssessorDropdown(false)
    setShowAssesseeDropdown(false)
  }

  // Submit random assessment
  const handleSubmit = async () => {
    // Validation
    if (!selectedAssessor) {
      notify.error('Please select an assessor')
      return false
    }
    
    if (selectedAssessees.length === 0) {
      notify.error('Please select at least one assessee')
      return false
    }

    if (!selectedSessionId) {
      notify.error('Please select a review session')
      return false
    }

    setIsSubmitting(true)

    try {
      const currentDate = new Date()
      const payload = {
        RAID: 0,
        AssessorID: selectedAssessor.EmpID,
        AssesseeIDs: selectedAssessees.map(emp => emp.EmpID),
        Month: currentDate.getMonth() + 1,
        Year: currentDate.getFullYear(),
        RSID: selectedSessionId
      }

      console.log('=== RANDOM ASSESSMENT PAYLOAD ===')
      console.log(JSON.stringify(payload, null, 2))
      console.log('=================================')

      await API.post('/RandomAssessments', payload)
      notify.success('Random assessment submitted successfully!')
      
      // Reset form after successful submission
      resetForm()
      return true
    } catch (error) {
      console.error('Failed to submit random assessment:', error)
      notify.error('Failed to submit random assessment. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    // State
    selectedAssessor,
    selectedAssessees,
    assessorSearch,
    assesseeSearch,
    showAssessorDropdown,
    showAssesseeDropdown,
    filteredAssessors,
    filteredAssessees,
    isSubmitting,

    // Refs
    assessorDropdownRef,
    assesseeDropdownRef,
    assessorInputRef,
    assesseeInputRef,

    // Setters
    setAssessorSearch,
    setAssesseeSearch,
    setShowAssessorDropdown,
    setShowAssesseeDropdown,

    // Actions
    handleAssessorSelect,
    handleAssesseeToggle,
    handleRemoveAssessee,
    clearAllAssessees,
    resetForm,
    handleSubmit
  }
}

export default useRandomAssessment