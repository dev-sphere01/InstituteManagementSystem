import React, { useMemo, useState } from 'react';
import { useThemeStore } from '../../../../store';
import TableService from '../../../../services/TableService';
import ConfirmationModal from '../../../../services/ConfrimationModal';

const AllCenterCode = ({ centerCodes, onEditCenterCode, onDeleteCenterCode, loading, error }) => {
  const { isDarkMode } = useThemeStore();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    centerCode: null,   
    loading: false
  });

  const handleDeleteClick = (centerCode) => {
    setDeleteModal({
      isOpen: true,
      centerCode: centerCode,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.centerCode) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await onDeleteCenterCode(deleteModal.centerCode._id);
      setDeleteModal({ isOpen: false, centerCode: null, loading: false });
    } catch (error) {
      // Error handling is done in the parent component
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteModal.loading) {
      setDeleteModal({ isOpen: false, centerCode: null, loading: false });
    }
  };

  // Define columns for TableService
  const columns = useMemo(() => [
    {
      accessorKey: 'centreCode',
      header: 'Centre Code',
      cell: info => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {info.getValue()}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'name',
      header: 'Centre Name',
      cell: info => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'State',
      header: 'State',
      cell: info => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {info.getValue()}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'City',
      header: 'City',
      cell: info => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {info.getValue()}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: info => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue() || 'N/A'}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: info => (
        <span className="text-gray-600 dark:text-gray-400">
          {info.getValue() || 'N/A'}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => (
        <span className="text-gray-600 dark:text-gray-400">
          {info.getValue() || 'N/A'}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: info => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow transition-colors duration-200"
            onClick={() => onEditCenterCode(row.original)}
          >
            ✏️ Edit
          </button>
          <button
            className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow transition-colors duration-200"
            onClick={() => handleDeleteClick(row.original)}
          >
            🗑️ Delete
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [onEditCenterCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">Loading center codes...</span>
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
    <>
      <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            All Center Codes
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total: {centerCodes.length}
            </span>
          </div>
        </div>
        <TableService columns={columns} data={centerCodes} initialPageSize={10} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Center Code"
        message={
          deleteModal.centerCode 
            ? `Are you sure you want to delete "${deleteModal.centerCode.name}" (${deleteModal.centerCode.centreCode})?`
            : "Are you sure you want to delete this center code?"
        }
        confirmText="YES, DELETE"
        cancelText="CANCEL"
        confirmButtonColor="red"
        icon="🗑️"
        loading={deleteModal.loading}
      />
    </>
  );
};

export default AllCenterCode;