import React, { useMemo } from 'react'
import TableService from '../../../../services/TableService'
import { useThemeStore } from '../../../../store'

const AllCourses = ({ courses, onEditCourse, onDeleteCourse, loading, error }) => {
  const { isDarkMode } = useThemeStore()

  const columns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: info => info.getValue(),
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'level',
        header: 'Level',
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: info =>
          info.getValue() ? (
            <span className="text-green-500 font-semibold">Yes</span>
          ) : (
            <span className="text-red-500 font-semibold">No</span>
          ),
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
              onClick={() => onEditCourse(row.original)}
            >
              ✏️ Edit
            </button>
            <button
              className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this course?'))
                  onDeleteCourse(row.original._id)
              }}
            >
              🗑️ Delete
            </button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onEditCourse, onDeleteCourse]
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-blue-500 text-lg font-semibold animate-pulse">
          Loading courses...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500 text-lg font-semibold">{error}</span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg shadow ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } p-4`}
    >
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        All Courses
      </h2>
      <TableService columns={columns} data={courses} initialPageSize={10} />
    </div>
  )
}

export default AllCourses