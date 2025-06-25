import React, { useMemo } from 'react';
import { useThemeStore } from '../../../../../store';
import TableService from '../../../../../services/TableService';

const AllUniversities = ({ universities, onEditUniversity, onDeleteUniversity, loading, error }) => {
  const { isDarkMode } = useThemeStore();

  const columns = useMemo(() => [
    {
      accessorKey: 'universityName',
      header: 'University Name',
      cell: info => {
        const value = info.getValue();
        return typeof value === 'string' ? value : <span className="text-red-500">Invalid</span>;
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow"
            onClick={() => onEditUniversity(row.original)}
          >
            ✏️ Edit
          </button>
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this university?')) {
                onDeleteUniversity(row.original._id);
              }
            }}
          >
            🗑️ Delete
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [onEditUniversity, onDeleteUniversity]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading universities...</span>
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

  if (!universities || universities.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          No universities found.
        </span>
      </div>
    );
  }

  const safeUniversities = universities.filter(u => u && typeof u.universityName === 'string');

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        All Universities
      </h2>
      <TableService columns={columns} data={safeUniversities} initialPageSize={10} />
    </div>
  );
};

export default AllUniversities;
