import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * Custom hook for employee search and dropdown functionality
 */
export const useEmployeeSearch = (allEmployees = []) =>
{
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Memoize filtered employees to prevent infinite re-renders
  const filteredEmployees = useMemo(() => {
    if (searchTerm.trim() === '') {
      return allEmployees
    } else {
      const searchLower = searchTerm.toLowerCase()
      return allEmployees.filter(emp => {
        const empNo = emp.EmpNo?.toString().toLowerCase() || ''
        const name = emp.Name?.toLowerCase() || ''
        const department = emp.Department?.toLowerCase() || ''

        return empNo.includes(searchLower) ||
          name.includes(searchLower) ||
          department.includes(searchLower)
      })
    }
  }, [searchTerm, allEmployees])

  // Handle click outside to close dropdown
  useEffect(() =>
  {
    const handleClickOutside = (event) =>
    {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = useCallback((value) =>
  {
    setSearchTerm(value)
    setShowDropdown(true)
  }, [])

  const handleDropdownToggle = useCallback(() =>
  {
    setShowDropdown(prev => !prev)
  }, [])

  const resetSearch = useCallback(() =>
  {
    setSearchTerm('')
    setShowDropdown(false)
  }, [])

  return {
    searchTerm,
    filteredEmployees,
    showDropdown,
    dropdownRef,
    inputRef,
    setSearchTerm: handleSearchChange,
    setShowDropdown,
    handleDropdownToggle,
    resetSearch
  }
}

export default useEmployeeSearch