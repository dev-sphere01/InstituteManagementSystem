import React, { useState, useEffect, useMemo } from 'react';
import { useThemeStore } from '../../../../store';
import API from '../../../../services/API';
import TableService from '../../../../services/TableService';

const AllRoles = ({ onEditRole }) => {
  const { isDarkMode } = useThemeStore();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await API.roles.getAll();
      if (response.success) {
        setRoles(response.data || []);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) return;

    try {
      setDeleteLoading(roleId);
      const response = await API.roles.delete(roleId);
      if (response.success) {
        setRoles(prev => prev.filter(role => role._id !== roleId));
      } else {
        setError('Failed to delete role');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete role');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.RoleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' ||
                          (filterActive === 'active' && role.isActive) ||
                          (filterActive === 'inactive' && !role.isActive);
    return matchesSearch && matchesFilter;
  });

  const columns = useMemo(() => [
    {
      accessorKey: 'RoleName',
      header: 'Role Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'level',
      header: 'Level',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: info => info.getValue() ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      )
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: info => `${info.getValue()?.length || 0}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onEditRole(role)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ✏️ Edit
            </button>
            {!role.isSystem && (
              <button
                onClick={() => handleDeleteRole(role._id, role.RoleName)}
                disabled={deleteLoading === role._id}
                className={`px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 ${deleteLoading === role._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {deleteLoading === role._id ? 'Deleting...' : '🗑️ Delete'}
              </button>
            )}
          </div>
        );
      },
    }
  ], [deleteLoading]);

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Roles</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage and view all system roles</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-3 py-2 border rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className={`px-3 py-2 border rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className="text-red-600 font-bold">×</button>
          </div>
        </div>
      )}

      <TableService columns={columns} data={filteredRoles} loading={loading} initialPageSize={10} />
    </div>
  );
};

export default AllRoles;