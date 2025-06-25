import React, { useMemo } from 'react';
import { useThemeStore } from './../../../../../store';
import TableService from './../../../../../services/TableService';

const AllBoards = ({ boards, onEditBoard, onDeleteBoard, loading, error }) => {
  const { isDarkMode } = useThemeStore();

  const columns = useMemo(() => [
    {
      accessorKey: 'boardName',
      header: 'Board Name',
      cell: info => info.getValue(),
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
            onClick={() => onEditBoard(row.original)}
          >
            ✏️ Edit
          </button>
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this board?')) {
                onDeleteBoard(row.original._id);
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
  ], [onEditBoard, onDeleteBoard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading boards...</span>
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

  if (!boards || boards.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          No boards found.
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        All Boards
      </h2>
      <TableService columns={columns} data={boards} initialPageSize={10} />
    </div>
  );
};

export default AllBoards;
