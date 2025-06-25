import React, { useMemo } from 'react';
import { useThemeStore } from '../../../../store';
// import TableService from '../../../../services/TableService';
import TableService from './../../../../services/TableService';

const AllBatches = ({ batches, onEditBatch, onDeleteBatch, loading, error }) => {
  const { isDarkMode } = useThemeStore();

  // Define columns for TableService
  const columns = useMemo(() => [
    {
      accessorKey: 'centreCode',
      header: 'Centre Code',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'batchTiming',
      header: 'Batch Timing',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'course',
      header: 'Course',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'teacherName',
      header: 'Teacher Name',
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
            onClick={() => onEditBatch(row.original)}
          >
            ✏️ Edit
          </button>
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this batch?')) onDeleteBatch(row.original._id);
            }}
          >
            🗑️ Delete
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [onEditBatch, onDeleteBatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading batches...</span>
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

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Batches</h2>
      <TableService columns={columns} data={batches} initialPageSize={10} />
    </div>
  );
};

export default AllBatches;