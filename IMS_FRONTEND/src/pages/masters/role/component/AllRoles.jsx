import React, { useState, useEffect } from 'react'
import { useThemeStore } from '../../../../store'
import API from '../../../../services/API'

const AllRoles = ({ onEditRole }) => {
  const { isDarkMode } = useThemeStore()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [filterSystem, setFilterSystem] = useState('all')

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Sorting states
  const [sort, setSort] = useState({
    sortBy: 'level',
    sortOrder: 'asc'
  })

  useEffect(() => {
    fetchRoles()
  }, [pagination.page, pagination.limit, sort.sortBy, sort.sortOrder, searchTerm, filterActive, filterSystem])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError('')

      // Build query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder
      }

      // Add search if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      // Add filters
      if (filterActive !== 'all') {
        params.isActive = filterActive === 'active'
      }

      if (filterSystem !== 'all') {
        params.isSystem = filterSystem === 'system'
      }

      const response = await API.roles.getAll(params)

      if (response.success) {
        setRoles(response.data || [])
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } else {
        setError('Failed to fetch roles')
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError(err.response?.data?.message || 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  // Handle sorting
  const handleSort = (field) => {
    setSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when sorting
  }

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when searching
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'active') {
      setFilterActive(value)
    } else if (filterType === 'system') {
      setFilterSystem(value)
    }
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when filtering
  }

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(roleId)
      const response = await API.roles.delete(roleId)

      if (response.success) {
        setRoles(prev => prev.filter(role => role._id !== roleId))
      } else {
        setError('Failed to delete role')
      }
    } catch (err) {
      console.error('Error deleting role:', err)
      setError(err.response?.data?.message || 'Failed to delete role')
    } finally {
      setDeleteLoading(null)
    }
  }



  if (loading) {
    return (
      <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading roles...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              All Roles
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and view all system roles
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              {pagination.total} role{pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterActive}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className={`block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={filterSystem}
              onChange={(e) => handleFilterChange('system', e.target.value)}
              className={`block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="system">System Only</option>
              <option value="custom">Custom Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide cursor-pointer hover:bg-opacity-75 ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('RoleName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Role Name</span>
                    {sort.sortBy === 'RoleName' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sort.sortOrder === 'asc' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Description
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide cursor-pointer hover:bg-opacity-75 ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Level</span>
                    {sort.sortBy === 'level' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sort.sortOrder === 'asc' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Permissions
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide cursor-pointer hover:bg-opacity-75 ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {sort.sortBy === 'createdAt' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sort.sortOrder === 'asc' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`relative px-6 py-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm || filterActive !== 'all' || filterSystem !== 'all'
                      ? 'No roles found matching your criteria'
                      : 'No roles found'
                    }
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {role.RoleName}
                          </div>
                          {role.isSystem && (
                            <div className="text-xs text-purple-600 font-medium">System Role</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {role.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {role.permissions?.length || 0} permissions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditRole(role)}
                          className={`text-blue-600 hover:text-blue-900 ${
                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                          }`}
                        >
                          Edit
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role._id, role.RoleName)}
                            disabled={deleteLoading === role._id}
                            className={`text-red-600 hover:text-red-900 ${
                              isDarkMode ? 'text-red-400 hover:text-red-300' : ''
                            } ${deleteLoading === role._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {deleteLoading === role._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                pagination.hasPrevPage
                  ? isDarkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  : isDarkMode
                    ? 'border-gray-700 text-gray-500 bg-gray-800 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                pagination.hasNextPage
                  ? isDarkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  : isDarkMode
                    ? 'border-gray-700 text-gray-500 bg-gray-800 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing{' '}
                <span className="font-medium">
                  {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              {/* Page navigation */}
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                    pagination.hasPrevPage
                      ? isDarkMode
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      : isDarkMode
                        ? 'border-gray-700 text-gray-500 bg-gray-800 cursor-not-allowed'
                        : 'border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.page
                          ? isDarkMode
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-blue-500 bg-blue-500 text-white'
                          : isDarkMode
                            ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                    pagination.hasNextPage
                      ? isDarkMode
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      : isDarkMode
                        ? 'border-gray-700 text-gray-500 bg-gray-800 cursor-not-allowed'
                        : 'border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllRoles