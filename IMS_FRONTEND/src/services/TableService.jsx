import React, { useMemo, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useThemeStore } from "../store";

/**
 * TableService supports both client and server (backend) pagination.
 * If serverPagination is true, you must provide pageCount and onPaginationChange.
 */
const TableService = ({
  columns,
  data,
  initialPageSize = 10,
  serverPagination = false,
  pageCount: controlledPageCount,
  onPaginationChange,
  loading = false,
  globalFilter, // <-- controlled input
  onGlobalFilterChange, // <-- controlled updater
}) => {
  const { isDarkMode } = useThemeStore();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  useEffect(() => {
    if (serverPagination && typeof onPaginationChange === "function") {
      onPaginationChange(pagination);
    }
    // eslint-disable-next-line
  }, [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      pagination,
    },
    onGlobalFilterChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: serverPagination,
    pageCount: serverPagination ? controlledPageCount : undefined,
    debugTable: false,
  });

  const tableBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const tableText = isDarkMode ? "text-gray-100" : "text-gray-900";
  const headerBg = isDarkMode ? "bg-gray-700" : "bg-gray-100";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const rowHover = isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-blue-50";

  // Debounced global search
  const [searchValue, setSearchValue] = useState(globalFilter ?? "");
  useEffect(() => {
    setSearchValue(globalFilter ?? "");
  }, [globalFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== globalFilter) {
        onGlobalFilterChange?.(searchValue);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const paginationBtnClass = `px-2 py-1 rounded border transition-colors duration-150 disabled:opacity-50 ${
    isDarkMode
      ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  }`;

  return (
    <div className={`w-full overflow-x-auto mt-2 p-3 rounded-xl border ${borderColor} ${tableBg} ${tableText}`}>
      {/* Global Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search..."
          className={`px-3 py-2 rounded-lg border ${borderColor} ${tableText} ${
            isDarkMode ? "bg-gray-700/80 placeholder-gray-400" : "bg-gray-50 placeholder-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 text-sm`}
          style={{ minWidth: 220 }}
        />
        {/* Page size selector */}
        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Rows per page:</span>
          <select
            className={`px-2 py-1.5 rounded-lg border ${borderColor} ${tableText} ${
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 text-xs font-medium`}
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size} className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table
        className={`min-w-full ${tableBg} ${tableText} border ${borderColor} rounded-lg shadow-sm overflow-hidden`}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`px-3 py-2.5 ${headerBg} ${borderColor} border-b text-left font-semibold select-none cursor-pointer text-xs uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="text-blue-500">
                        {header.column.getIsSorted() === "asc"
                          ? "▲"
                          : header.column.getIsSorted() === "desc"
                          ? "▼"
                          : ""}
                      </span>
                    )}
                  </div>
                  {/* Column filter */}
                  {header.column.getCanFilter() && (
                    <input
                      type="text"
                      value={header.column.getFilterValue() ?? ""}
                      onChange={(e) =>
                        header.column.setFilterValue(e.target.value)
                      }
                      placeholder={`Filter...`}
                      className={`mt-1.5 px-2 py-1 rounded border ${borderColor} ${tableText} ${
                        isDarkMode ? "bg-gray-800 placeholder-gray-500" : "bg-white placeholder-gray-400"
                      } w-full text-[10px] font-normal focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-blue-400 animate-pulse"
              >
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`text-center py-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                No data found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={`${rowHover} transition-colors`}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 border-b ${borderColor} align-middle text-sm`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <button
            className={paginationBtnClass}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className={paginationBtnClass}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <span className="mx-2">
            Page{" "}
            <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {serverPagination && controlledPageCount
                ? controlledPageCount
                : table.getPageCount()}
            </strong>
          </span>
          <button
            className={paginationBtnClass}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className={paginationBtnClass}
            onClick={() =>
              table.setPageIndex(
                (serverPagination && controlledPageCount
                  ? controlledPageCount
                  : table.getPageCount()) - 1
              )
            }
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={
              serverPagination && controlledPageCount
                ? controlledPageCount
                : table.getPageCount()
            }
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className={`w-16 px-2 py-1 rounded border ${borderColor} ${tableText} ${
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 text-center transition-all duration-150`}
          />
        </div>
      </div>
    </div>
  );
};

export default TableService;
