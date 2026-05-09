import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'

const EmployeeSearchDropdown = ({
  label,
  placeholder,
  searchTerm,
  onSearchChange,
  showDropdown,
  onDropdownToggle,
  filteredEmployees,
  onEmployeeSelect,
  selectedEmployee,
  onClearSelection,
  dropdownRef,
  inputRef,
  disabled = false,
  getEmployeeDisplayName
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => onDropdownToggle(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedEmployee && (
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => onDropdownToggle(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded"
            type="button"
            disabled={disabled}
          >
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <button
                  key={emp.EmpID}
                  onClick={() => onEmployeeSelect(emp)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  type="button"
                >
                  <div className="font-medium text-gray-900">
                    {getEmployeeDisplayName ? getEmployeeDisplayName(emp) : emp.Name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {emp.EmpNo} • {emp.Department}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No employees found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EmployeeSearchDropdown