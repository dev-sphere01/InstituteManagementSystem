import React, { useMemo, useState } from 'react';
import { useThemeStore } from '../../../../store';

import TableService from '../../../../services/TableService';
import ConfirmationModal from '../../../../services/ConfrimationModal';

const AllAdditionalFeatures = ({ features = [], loading, error, onEdit, onDelete }) => {
  const { isDarkMode } = useThemeStore();
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const columns = useMemo(() => [
    {
      header: 'Feature',
      accessorKey: 'additionalFeatures',
      cell: ({ getValue }) => {
        const value = getValue();
        return value || '-';
      },
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const value = getValue();
        return value || '-';
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const value = getValue();
        return value || '-';
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => {
        const value = getValue();
        return value || '-';
      },
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      enableSorting: false,
      cell: ({ row }) => {
        const feature = row?.original;
        if (!feature) return null;

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
      <TableService columns={columns} data={features || []} loading={loading} />

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
