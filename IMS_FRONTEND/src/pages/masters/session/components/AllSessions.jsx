import React, { useMemo } from 'react';
import { useThemeStore } from '../../../../store';
import TableService from '../../../../services/TableService';

const AllSessions = ({ sessions, onEditSession, onDeleteSession, loading, error }) => {
  const { isDarkMode } = useThemeStore();

  const columns = useMemo(() => [
    {
      accessorKey: 'sessionName',
      header: 'Session Name',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '',
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '',
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: info => info.getValue() ? (
        <span className="text-green-500 font-semibold">Yes</span>
      ) : (
        <span className="text-red-500 font-semibold">No</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'cityNames',
      header: 'Cities',
      cell: info => Array.isArray(info.getValue()) ? info.getValue().join(', ') : '',
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => info.getValue(),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow"
            onClick={() => onEditSession(row.original)}
          >
            ✏️ Edit
          </button>
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this session?')) onDeleteSession(row.original._id);
            }}
          >
            🗑️ Delete
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [onEditSession, onDeleteSession]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500 text-lg font-semibold">{error}</span>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No sessions found.</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Sessions</h2>
      <TableService columns={columns} data={sessions} initialPageSize={10} />
    </div>
  );
};

export default AllSessions;