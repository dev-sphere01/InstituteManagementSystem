import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useThemeStore } from '../store';

const TableService = ({ columns, data, initialPageSize = 10 }) => {
  const { isDarkMode } = useThemeStore();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  // Theme classes
  const tableBg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const tableText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const headerBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const rowHover = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50';

  return (
    <div className="w-full overflow-x-auto">
      {/* Global Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className={`px-3 py-2 rounded border ${borderColor} ${tableText} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
          style={{ minWidth: 200 }}
        />
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            className={`px-2 py-1 rounded border ${borderColor} ${tableText} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <table className={`min-w-full ${tableBg} ${tableText} border ${borderColor} rounded-lg shadow-sm`}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`px-3 py-2 ${headerBg} ${borderColor} border-b text-left font-semibold select-none cursor-pointer`}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Sort indicator */}
                    {header.column.getCanSort() && (
                      <span>
                        {header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : ''}
                      </span>
                    )}
                  </div>
                  {/* Column filter */}
                  {header.column.getCanFilter() && (
                    <input
                      type="text"
                      value={header.column.getFilterValue() ?? ''}
                      onChange={e => header.column.setFilterValue(e.target.value)}
                      placeholder={`Filter...`}
                      className={`mt-1 px-2 py-1 rounded border ${borderColor} ${tableText} ${isDarkMode ? 'bg-gray-700' : 'bg-white'} w-full text-xs`}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                No data found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className={`${rowHover} transition-colors`}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={`px-3 py-2 border-b ${borderColor} align-middle`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <button
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        <div>
          Go to page:{' '}
          <input
            type="number"
            min={1}
            max={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 px-2 py-1 rounded border border-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default TableService;