import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import useReportStore from '@/store/reportStore';
import {
  FileText,
  Download,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import reportService from '@/services/Payroll/reportService';
import notification from '@/services/NotificationService';
import TableService from '@/services/TableService';
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

const Reports = () => {
  const navigate = useNavigate();
  const {
    selectedFields, setSelectedFields,
    filters, setFilters,
    reportData, setReportData,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    showSidebar, setShowSidebar,
    sortConfig, setSortConfig,
    searchText, setSearchText,
    resetReport
  } = useReportStore();

  // ============ STATE MANAGEMENT ============
  const [availableFields, setAvailableFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    fields: true,
    filters: true,
    results: true,
  });

  // Employee status options
  const statusOptions = ['Active', 'Inactive', 'OnLeave', 'Suspended'];

  // ============ EFFECTS ============
  useEffect(() => {
    loadAvailableFields();
  }, []);

  // ============ FUNCTIONS ============

  /**
   * Load available fields from service
   */
  const loadAvailableFields = async () => {
    try {
      const fields = await reportService.getAvailableFields();
      setAvailableFields(fields);
    } catch (error) {
      console.error('Error loading fields:', error);
      notification().error('Failed to load available fields');
    }
  };

  /**
   * Toggle field selection while maintaining field order
   */
  const handleFieldToggle = (fieldKey) => {
    if (selectedFields.includes(fieldKey)) {
      // Remove field
      setSelectedFields((prev) => prev.filter((f) => f !== fieldKey));
    } else {
      // Add field while maintaining order from availableFields
      setSelectedFields((prev) => {
        const newFields = [...prev, fieldKey];
        // Sort fields based on their order in availableFields
        return newFields.sort((a, b) => {
          const [sectionA, keyA] = a.split('.');
          const [sectionB, keyB] = b.split('.');
          
          const indexA = getFieldIndex(sectionA, keyA);
          const indexB = getFieldIndex(sectionB, keyB);
          
          return indexA - indexB;
        });
      });
    }
  };

  /**
   * Get field index from availableFields for sorting
   */
  const getFieldIndex = (section, fieldKey) => {
    const categories = Object.keys(availableFields);
    let totalIndex = 0;
    
    for (const cat of categories) {
      if (cat === section) {
        const fieldIndex = (availableFields[cat] || []).findIndex(f => f.key === fieldKey);
        return totalIndex + (fieldIndex >= 0 ? fieldIndex : 999);
      }
      totalIndex += (availableFields[cat] || []).length;
    }
    return 999;
  };

  /**
   * Select all fields in a category while maintaining order
   */
  const handleSelectAllInCategory = (category) => {
    const categoryFields = availableFields[category] || [];
    const categoryFieldKeys = categoryFields.map((f) => `${category}.${f.key}`);
    const allSelected = categoryFieldKeys.every((f) => selectedFields.includes(f));

    if (allSelected) {
      setSelectedFields((prev) =>
        prev.filter((f) => !categoryFieldKeys.includes(f))
      );
    } else {
      setSelectedFields((prev) => {
        const newFields = [...new Set([...prev, ...categoryFieldKeys])];
        // Sort fields based on their order in availableFields
        return newFields.sort((a, b) => {
          const [sectionA, keyA] = a.split('.');
          const [sectionB, keyB] = b.split('.');
          
          const indexA = getFieldIndex(sectionA, keyA);
          const indexB = getFieldIndex(sectionB, keyB);
          
          return indexA - indexB;
        });
      });
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Generate report
   */
  const handleGenerateReport = async () => {
    if (selectedFields.length === 0) {
      notification().warning('Please select at least one field');
      return;
    }

    setLoading(true);
    try {
      const reportRequest = {
        fields: selectedFields,
        status: filters.status || null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await reportService.generateReport(reportRequest);
      // Format dates in preview data to remove time part
      const formattedData = formatDateValues(data);
      setReportData(formattedData);
      notification().success(`Report generated successfully! (${formattedData?.length || 0} records)`);
    } catch (error) {
      console.error('Error generating report:', error);
      notification().error(
        error.response?.data?.message || 'Failed to generate report'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export report to Excel
   */
  const handleExportExcel = async () => {
    if (selectedFields.length === 0) {
      notification().warning('Please select at least one field');
      return;
    }

    setLoading(true);
    try {
      const reportRequest = {
        fields: selectedFields,
        status: filters.status || null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await reportService.generateReport(reportRequest);
      
      // Transform data to use clean field labels instead of "Section.FieldName"
      let cleanedData = data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
          const cleanKey = reportService.getFieldLabel(key, availableFields);
          newRow[cleanKey] = value;
        });
        return newRow;
      });

      // Format dates to remove time portion
      cleanedData = formatDateValues(cleanedData);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      
      const fileName = `Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      notification().success('Report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      notification().error('Failed to export report to Excel');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export report to CSV
   */
  const handleExportCSV = async () => {
    if (selectedFields.length === 0) {
      notification().warning('Please select at least one field');
      return;
    }

    setLoading(true);
    try {
      const reportRequest = {
        fields: selectedFields,
        status: filters.status || null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await reportService.generateReport(reportRequest);
      
      // Transform data to use clean field labels instead of "Section.FieldName"
      let cleanedData = data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
          const cleanKey = reportService.getFieldLabel(key, availableFields);
          newRow[cleanKey] = value;
        });
        return newRow;
      });

      // Format dates to remove time portion
      cleanedData = formatDateValues(cleanedData);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      
      const fileName = `Report_${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(workbook, fileName);
      notification().success('Report exported to CSV successfully!');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      notification().error('Failed to export report to CSV');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download JSON report with clean field headers
   */
  const handleDownloadJSON = () => {
    if (!reportData || reportData.length === 0) {
      notification().warning('No data to download');
      return;
    }

    // Transform data to use clean field names instead of "Section.FieldName"
    let cleanedData = reportData.map(row => {
      const newRow = {};
      Object.entries(row).forEach(([key, value]) => {
        const cleanKey = getCleanFieldName(key);
        newRow[cleanKey] = value;
      });
      return newRow;
    });

    // Format dates to remove time portion
    cleanedData = formatDateValues(cleanedData);

    const dataStr = JSON.stringify(cleanedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `Report_${new Date().toISOString().split('T')[0]}.json`;
    reportService.downloadFile(blob, fileName);
    notification().success('Report downloaded as JSON!');
  };

  /**
   * Clear all filters and selections
   */
  const handleReset = () => {
    setSelectedFields([]);
    setFilters({ status: '', startDate: '', endDate: '' });
    setReportData(null);
    setCurrentPage(1);
    setPageSize(25);
    setSortConfig({ column: null, direction: 'asc' });
    setSearchText('');
  };

  /**
   * Calculate pagination values using processed (filtered and sorted) data
   */
  const getPaginationData = () => {
    const processedData = getProcessedData();
    const totalRecords = processedData?.length || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    const paginatedData = processedData?.slice(startIndex, endIndex) || [];

    return {
      totalRecords,
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
    };
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  /**
   * Handle page navigation
   */
  const handlePageChange = (newPage) => {
    const { totalPages } = getPaginationData();
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Toggle section expansion
   */
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * Get count of selected fields per category
   */
  const getSelectedCountByCategory = (category) => {
    return selectedFields.filter((f) => f.startsWith(`${category}.`)).length;
  };

  /**
   * Get total count of fields in category
   */
  const getTotalCountByCategory = (category) => {
    return (availableFields[category] || []).length;
  };

  /**
   * Get sorted and filtered data
   */
  const getProcessedData = () => {
    if (!reportData) return [];

    let processedData = [...reportData];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      processedData = processedData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (sortConfig.column) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Compare values
        let comparison = 0;
        
        // Handle numeric types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } 
        // Handle numeric strings (for EmployeeID, etc.)
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
          const aNum = parseFloat(aValue);
          const bNum = parseFloat(bValue);
          
          // If both are valid numbers, compare numerically
          if (!isNaN(aNum) && !isNaN(bNum) && String(aNum) === aValue.trim() && String(bNum) === bValue.trim()) {
            comparison = aNum - bNum;
          } else {
            // Otherwise compare as strings
            comparison = aValue.localeCompare(bValue);
          }
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return processedData;
  };

  /**
   * Handle column sort (three-state: asc → desc → unsorted)
   */
  const handleSort = (column) => {
    setSortConfig((prev) => {
      // If clicking the same column, cycle through: asc → desc → unsorted
      if (prev.column === column) {
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { column: null, direction: 'asc' };
        }
      }
      // If clicking a different column, start with ascending
      return { column, direction: 'asc' };
    });
  };

  /**
   * Get sort indicator for column header
   */
  const getSortIndicator = (column) => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  /**
   * Check if column is sticky (first two columns)
   */
  const isStickyColumn = (fieldKey) => {
    return selectedFields.indexOf(fieldKey) < 2;
  };

  /**
   * Format field name for display (clean header names)
   * Converts "Employee.EmployeeName" to "Employee Name"
   */
  const getCleanFieldName = (fieldKey) => {
    if (!fieldKey) return fieldKey;
    
    const parts = fieldKey.split('.');
    if (parts.length === 2) {
      // Find the field label from availableFields
      const [section, fieldName] = parts;
      const fields = availableFields[section] || [];
      const fieldDef = fields.find(f => f.key === fieldName);
      if (fieldDef) {
        return fieldDef.label;
      }
    }
    return fieldKey;
  };

  /**
   * Format dates to remove time portion (only keep date)
   * Converts "2024-01-15T10:30:00Z" to "2024-01-15"
   * Handles: Date of Joining, Date of Birth, Date of Appraisal, and all date fields
   */
  const formatDateValues = (data) => {
    return data.map(row => {
      const newRow = {};
      Object.entries(row).forEach(([key, value]) => {
        // Check if this is a date field (Date of Joining, Date of Birth, Date of Appraisal, etc.)
        if ((key.includes('Date') || key.includes('date')) && value) {
          // Check if value is a date string
          if (typeof value === 'string') {
            // Handle ISO format with time (2024-01-15T10:30:00Z or 2024-01-15T10:30:00)
            if (value.includes('T')) {
              newRow[key] = value.split('T')[0];
            }
            // Handle space-separated format (2024-01-15 10:30:00)
            else if (value.includes(' ')) {
              newRow[key] = value.split(' ')[0];
            }
            // Already formatted as date only (YYYY-MM-DD)
            else {
              newRow[key] = value;
            }
          } else if (value instanceof Date) {
            // Handle Date objects
            newRow[key] = value.toISOString().split('T')[0];
          } else {
            newRow[key] = value;
          }
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          </div>
          <p className="text-gray-600">
            Create customized reports by selecting fields, applying filters, and exporting in multiple formats.
          </p>
        </div>
        
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? 'Hide controls panel' : 'Show controls panel'}
          className="mt-1 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          {showSidebar ? (
            <PanelLeftClose className="w-6 h-6 text-indigo-600" />
          ) : (
            <PanelLeftOpen className="w-6 h-6 text-indigo-600" />
          )}
        </button>
      </div>

      <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
        showSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'
      }`}>
        {/* SIDEBAR - Controls */}
        {showSidebar && (
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="bg-white rounded-lg shadow-md sticky top-6 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* FIELD SELECTION SECTION */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('fields')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <h2 className="font-semibold text-gray-900">Select Fields</h2>
                {expandedSections.fields ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSections.fields && (
                <div className="p-4 space-y-4">
                  {Object.entries(availableFields).map(([category, fields]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-sm text-gray-700">
                          {category}
                        </label>
                        <button
                          onClick={() => handleSelectAllInCategory(category)}
                          className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                        >
                          {getSelectedCountByCategory(category) ===
                          getTotalCountByCategory(category)
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {fields.map((field) => {
                          const fieldKey = `${category}.${field.key}`;
                          const isSelected = selectedFields.includes(fieldKey);
                          return (
                            <label
                              key={fieldKey}
                              className="flex items-center gap-2 text-sm cursor-pointer hover:text-indigo-600 transition"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleFieldToggle(fieldKey)}
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                              <span className="text-gray-700">{field.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FILTERS SECTION */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('filters')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {expandedSections.filters ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSections.filters && (
                <div className="p-4 space-y-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Summary */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <strong>Selected Fields:</strong> {selectedFields.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-4 space-y-3">
              <button
                onClick={handleGenerateReport}
                disabled={loading || selectedFields.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Preview Report
              </button>

              <button
                onClick={handleExportExcel}
                disabled={loading || selectedFields.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium text-sm"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export to Excel
              </button>

              <button
                onClick={handleExportCSV}
                disabled={loading || selectedFields.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium text-sm"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export to CSV
              </button>

              {reportData && (
                <button
                  onClick={handleDownloadJSON}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition font-medium text-sm"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download JSON
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        )}

        {/* MAIN CONTENT - Results */}
        <div className={`transition-all duration-300 ${
          showSidebar ? 'lg:col-span-3' : 'lg:col-span-1'
        }`}>
          {/* RESULTS SECTION */}
          {reportData ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Results Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">Report Results</h2>
                      <p className="text-indigo-100">
                        {getProcessedData().length} record{getProcessedData().length !== 1 ? 's' : ''} found
                        {reportData.length !== getProcessedData().length && ` (filtered from ${reportData.length})`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">
                      Generated: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* Search Box */}
                <div>
                  <input
                    type="text"
                    placeholder="🔍 Search in all columns..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-90 text-gray-900 placeholder-gray-500 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white"
                  />
                </div>
              </div>

              {/* Results Table with Scroll Control */}
              <div className="relative overflow-hidden">
                {/* Horizontal & Vertical Scroll Container */}
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 border-b sticky top-0 z-20">
                      <tr>
                        {selectedFields.map((field) => {
                          const sticky = isStickyColumn(field);
                          const isFirst = selectedFields.indexOf(field) === 0;
                          const isSecond = selectedFields.indexOf(field) === 1;
                          let leftPosition = 'auto';
                          if (sticky && isFirst) leftPosition = '0px';
                          else if (sticky && isSecond) leftPosition = '120px';
                          
                          return (
                            <th
                              key={field}
                              onClick={() => handleSort(field)}
                              className={`px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap border-r border-gray-300 cursor-pointer hover:bg-gray-200 transition ${
                                sticky ? 'sticky shadow-sm' : ''
                              } ${sortConfig.column === field ? 'bg-indigo-100' : 'bg-gray-100'}`}
                              style={sticky ? { 
                                left: leftPosition,
                                zIndex: 20
                              } : {}}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span>{getCleanFieldName(field)}</span>
                                <span className="text-xs text-gray-500">{getSortIndicator(field)}</span>
                              </div>
                            </th>
                          );
                        })}
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100 border-b sticky top-0 z-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginationData()
                        .paginatedData.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="border-b hover:bg-indigo-50 transition"
                          >
                            {selectedFields.map((field) => {
                              const sticky = isStickyColumn(field);
                              const isFirst = selectedFields.indexOf(field) === 0;
                              const isSecond = selectedFields.indexOf(field) === 1;
                              let leftPosition = 'auto';
                              if (sticky && isFirst) leftPosition = '0px';
                              else if (sticky && isSecond) leftPosition = '120px';
                              
                              return (
                                <td
                                  key={`${rowIndex}-${field}`}
                                  className={`px-6 py-3 text-gray-700 border-r border-gray-200 ${
                                    sticky ? 'sticky bg-white' : ''
                                  }`}
                                  style={sticky ? { 
                                    left: leftPosition,
                                    zIndex: 10
                                  } : {}}
                                >
                                  {formatCellValue(row[field])}
                                </td>
                              );
                            })}
                            <td className="px-6 py-3 border-r border-gray-200">
                              <button
                                onClick={() => navigate(`/dashboard/all-employees/${row.EmpID || row.empID}`)}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition text-xs font-medium"
                                title="View Employee Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {reportData && reportData.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t space-y-4">
                  {/* Page Size and Info Row */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Records per page */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">
                        Records per page:
                      </label>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    {/* Record info */}
                    <p className="text-sm text-gray-600 font-medium">
                      Showing {getPaginationData().startIndex + 1} to{' '}
                      {getPaginationData().endIndex} of {getPaginationData().totalRecords}{' '}
                      records
                    </p>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: getPaginationData().totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          const { totalPages } = getPaginationData();
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!showPage && page !== 2 && page !== totalPages - 1) {
                            return null;
                          }

                          if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-2 py-1 text-gray-500 text-sm"
                              >
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getPaginationData().totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition"
                      title="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Page Info */}
                    <span className="ml-4 text-sm text-gray-600 font-medium">
                      Page {currentPage} of {getPaginationData().totalPages}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Report Generated Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Select fields and click "Preview Report" to generate a report.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Select at least one field from each category</li>
                  <li>
                    Optionally apply filters (Status, Date Range)
                  </li>
                  <li>Click "Preview Report" to see the results</li>
                  <li>Export to Excel, CSV, or download JSON</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Format cell values for display
 * Handles dates, currency, booleans, and text formatting
 */
function formatCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const strValue = String(value).trim();
  
  if (strValue === '' || strValue === 'N/A') {
    return strValue || '-';
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle dates in various formats
  if (value instanceof Date) {
    return value.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  // Check if string is a date format (ISO, with or without time)
  if (typeof strValue === 'string') {
    // Match ISO date format with optional time
    if (strValue.match(/^\d{4}-\d{2}-\d{2}(T|Z|\s)/)) {
      try {
        const date = new Date(strValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          });
        }
      } catch {
        // Continue with other formatting
      }
    }
    
    // Match dd/MM/yyyy format - already formatted, return as is
    if (strValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return strValue;
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Format currency if looks like salary/amount (greater than 1000)
    if (value > 1000 && Number.isFinite(value)) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(value);
    }
    // Format regular numbers with thousand separator
    if (Number.isFinite(value)) {
      return value.toLocaleString('en-IN');
    }
  }

  // Handle objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Return string values, truncated to 100 chars
  return String(value).substring(0, 100);
}

export default Reports;