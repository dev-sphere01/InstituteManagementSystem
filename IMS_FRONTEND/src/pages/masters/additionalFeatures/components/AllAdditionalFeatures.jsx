import React, { useMemo, useState } from 'react';
import { useThemeStore } from '../../../../store';

import TableService from '../../../../services/TableService';
import ConfirmationModal from '../../../../services/ConfrimationModal';

const AllAdditionalFeatures = ({ features = [], loading, error, onEdit, onDelete }) => {
  const { isDarkMode } = useThemeStore();
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter out any undefined, null, or invalid data entries
  const validFeatures = useMemo(() => {
    return Array.isArray(features)
      ? features.filter(feature => feature && typeof feature === 'object' && feature._id)
      : [];
  }, [features]);

  const columns = useMemo(() => [
    {
      header: 'Feature',
      accessorKey: 'additionalFeatures',
      cell: ({ getValue, row }) => {
        try {
          const value = getValue();
          return value || '-';
        } catch (error) {
          console.warn('Error accessing additionalFeatures:', error);
          return '-';
        }
      },
    },
    // {
    //   header: 'Type',
    //   accessorKey: 'type',
    //   cell: ({ getValue, row }) => {
    //     try {
    //       const value = getValue();
    //       return value || '-';
    //     } catch (error) {
    //       console.warn('Error accessing type:', error);
    //       return '-';
    //     }
    //   },
    // },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue, row }) => {
        try {
          const value = getValue();
          return value || '-';
        } catch (error) {
          console.warn('Error accessing status:', error);
          return '-';
        }
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue, row }) => {
        try {
          const value = getValue();
          return value || '-';
        } catch (error) {
          console.warn('Error accessing description:', error);
          return '-';
        }
      },
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      enableSorting: false,
      cell: ({ row }) => {
        const feature = row?.original;
        if (!feature || !feature._id) return null;

        return (
          <div className="text-sm text-right space-x-2">
            <button
              onClick={() => onEdit(feature)}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDeleteId(feature._id);
                setConfirmOpen(true);
              }}
              className="text-red-600 hover:underline dark:text-red-400"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ], [onEdit]);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  if (error) {
    return <p className="text-sm text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <div>
      <TableService columns={columns} data={validFeatures} loading={loading} />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Feature"
        message="Are you sure you want to delete this feature? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        icon="🗑️"
      />
    </div>
  );
};

export default AllAdditionalFeatures;
