import React, { useState, useEffect } from 'react'
import { useThemeStore } from '../../../../store'
import API from '../../../../services/API'

const AllRoles = ({ onEditRole }) => {
  const { isDarkMode } = useThemeStore()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await API.roles.getAll()

      if (response.success) {
        setRoles(response.data || [])
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

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.RoleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterActive === 'all' ||
                         (filterActive === 'active' && role.isActive) ||
                         (filterActive === 'inactive' && !role.isActive)

    return matchesSearch && matchesFilter
  })

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
              {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
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

      {/* Roles List */}
      <div className="p-6">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No roles found
            </h3>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterActive !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first role'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role._id}
                className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-750 hover:bg-gray-700'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {role.RoleName}
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Level {role.level}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {role.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}

                    {role.isSystem && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        System
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {role.description}
                </p>

                {/* Permissions Count */}
                <div className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{role.permissions?.length || 0}</span> permissions assigned
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEditRole(role)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isDarkMode
                        ? 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Edit
                  </button>

                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role._id, role.RoleName)}
                      disabled={deleteLoading === role._id}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        deleteLoading === role._id
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      } ${
                        isDarkMode
                          ? 'bg-red-900 text-red-200 hover:bg-red-800'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {deleteLoading === role._id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          Deleting...
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllRoles