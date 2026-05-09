import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
import leaveReportService from '@/services/LeaveManagement/leaveReportService';
import notification from '@/services/NotificationService';
import TableService from '@/services/TableService';
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

const LeaveReports = () => {
  // ============ STATE MANAGEMENT ============
  const [availableFields, setAvailableFields] = useState({});
  const [selectedFields, setSelectedFields] = useState([]);
  const [fieldOrder, setFieldOrder] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    department: '',
    empId: '',
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    fields: true,
    filters: true,
    results: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('custom');
  const [registerReportView, setRegisterReportView] = useState('manager');
  const [registerReportData, setRegisterReportData] = useState(null);
  const [registerReportLoading, setRegisterReportLoading] = useState(false);

  // Leave status and type options
  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const leaveTypeOptions = ['Unpaid', 'Earned', 'On-Duty', 'Other'];

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
      const fields = await leaveReportService.getAvailableFields();
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
      setSelectedFields((prev) => prev.filter((f) => f !== fieldKey));
    } else {
      setSelectedFields((prev) => {
        const newFields = [...prev, fieldKey];
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
        leaveType: filters.leaveType || null,
        department: filters.department || null,
        empId: filters.empId ? parseInt(filters.empId) : null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await leaveReportService.generateReport(reportRequest);
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
   * Format date values in data (remove time portion)
   */
  const formatDateValues = (data) => {
    if (!Array.isArray(data)) return data;

    return data.map(row => {
      const newRow = { ...row };
      Object.entries(newRow).forEach(([key, value]) => {
        if (value && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          newRow[key] = value.split('T')[0];
        }
      });
      return newRow;
    });
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
        leaveType: filters.leaveType || null,
        department: filters.department || null,
        empId: filters.empId ? parseInt(filters.empId) : null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await leaveReportService.generateReport(reportRequest);

      let cleanedData = data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
          const cleanKey = leaveReportService.getFieldLabel(key, availableFields);
          newRow[cleanKey] = value;
        });
        return newRow;
      });

      cleanedData = formatDateValues(cleanedData);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Report');

      const fileName = `LeaveReport_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        leaveType: filters.leaveType || null,
        department: filters.department || null,
        empId: filters.empId ? parseInt(filters.empId) : null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null,
        format: 'JSON',
      };

      const data = await leaveReportService.generateReport(reportRequest);

      let cleanedData = data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
          const cleanKey = leaveReportService.getFieldLabel(key, availableFields);
          newRow[cleanKey] = value;
        });
        return newRow;
      });

      cleanedData = formatDateValues(cleanedData);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Report');

      const fileName = `LeaveReport_${new Date().toISOString().split('T')[0]}.csv`;
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
   * Download JSON report
   */
  const handleDownloadJSON = () => {
    if (!reportData || reportData.length === 0) {
      notification().warning('No data to download');
      return;
    }

    let cleanedData = reportData.map(row => {
      const newRow = {};
      Object.entries(row).forEach(([key, value]) => {
        const cleanKey = getCleanFieldName(key);
        newRow[cleanKey] = value;
      });
      return newRow;
    });

    cleanedData = formatDateValues(cleanedData);

    const dataStr = JSON.stringify(cleanedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `LeaveReport_${new Date().toISOString().split('T')[0]}.json`;
    leaveReportService.downloadFile(blob, fileName);
    notification().success('Report downloaded as JSON!');
  };

  /**
   * Get clean field name from composite key
   */
  const getCleanFieldName = (key) => {
    return leaveReportService.getFieldLabel(key, availableFields) || key;
  };

  /**
   * Generate Leave Register Report
   */
  const handleGenerateRegisterReport = async () => {
    setRegisterReportLoading(true);
    try {
      const data = await leaveReportService.generateLeaveRegisterReport(registerReportView);
      setRegisterReportData(data);
      notification().success(`Leave Register Report (${registerReportView}) generated successfully! (${data?.length || 0} records)`);
    } catch (error) {
      console.error('Error generating register report:', error);
      notification().error(
        error.response?.data?.message || 'Failed to generate leave register report'
      );
    } finally {
      setRegisterReportLoading(false);
    }
  };

  /**
   * Export Register Report to Excel
   */
  const handleExportRegisterReportExcel = () => {
    if (!registerReportData || registerReportData.length === 0) {
      notification().warning('No data to export');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(registerReportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Leave Register (${registerReportView})`);

    const fileName = `LeaveRegisterReport_${registerReportView}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    notification().success('Report exported to Excel successfully!');
  };

  /**
   * Clear all filters and selections
   */
  const handleReset = () => {
    setSelectedFields([]);
    setFilters({ status: '', leaveType: '', startDate: '', endDate: '', department: '', empId: '' });
    setReportData(null);
    setCurrentPage(1);
    setPageSize(25);
    setSortConfig({ column: null, direction: 'asc' });
    setSearchText('');
  };

  /**
   * Get sorted and filtered data
   */
  const getProcessedData = () => {
    if (!reportData) return [];

    let processedData = [...reportData];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      processedData = processedData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    if (sortConfig.column) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return processedData;
  };

  /**
   * Calculate pagination values
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
   * Handle column sort
   */
  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { totalRecords, totalPages, startIndex, endIndex, paginatedData } = getPaginationData();

  const canExport = hasPermission('leave_management.leave_reports.export');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* TAB BAR */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => {
            setActiveTab('custom');
            setShowSidebar(true);
          }}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'custom'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Custom Report
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'register'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Leave Register Report
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Custom Report */}
        {activeTab === 'custom' && showSidebar && (
          <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Leave Report</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <PanelLeftClose size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* FIELDS SECTION */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('fields')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Select Fields</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {selectedFields.length} selected
                    </span>
                  </div>
                  {expandedSections.fields ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expandedSections.fields && (
                  <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(availableFields).map(([category, fields]) => (
                      <div key={category} className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getSelectedCountByCategory(category) === getTotalCountByCategory(category)}
                            onChange={() => handleSelectAllInCategory(category)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {category} ({getSelectedCountByCategory(category)}/{getTotalCountByCategory(category)})
                          </span>
                        </label>

                        <div className="ml-6 space-y-1">
                          {fields.map((field) => (
                            <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFields.includes(`${category}.${field.key}`)}
                                onChange={() => handleFieldToggle(`${category}.${field.key}`)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-600">{field.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FILTERS SECTION */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('filters')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-green-600" />
                    <span className="font-medium text-gray-900">Filters</span>
                  </div>
                  {expandedSections.filters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expandedSections.filters && (
                  <div className="p-3 space-y-3">
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      name="leaveType"
                      value={filters.leaveType}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Leave Types</option>
                      {leaveTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="department"
                      placeholder="Department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <input
                      type="number"
                      name="empId"
                      placeholder="Employee ID"
                      value={filters.empId}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Eye size={18} />}
                  Generate Report
                </button>

                {reportData && (
                  <>
                    {!canExport &&
                      <>
                        <button
                          onClick={handleExportExcel}
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                          Export to Excel
                        </button>

                        <button
                          onClick={handleExportCSV}
                          disabled={loading}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                          Export to CSV
                        </button>
                      </>
                    }
                    <button
                      onClick={handleDownloadJSON}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                      Download JSON
                    </button>
                  </>
                )}

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR - Leave Register Report */}
        {activeTab === 'register' && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Leave Register Report</h2>

            {/* View Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select View</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registerView"
                    value="manager"
                    checked={registerReportView === 'manager'}
                    onChange={(e) => setRegisterReportView(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Manager View</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registerView"
                    value="hr"
                    checked={registerReportView === 'hr'}
                    onChange={(e) => setRegisterReportView(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">HR View</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateRegisterReport}
              disabled={registerReportLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {registerReportLoading ? <Loader size={18} className="animate-spin" /> : <Eye size={18} />}
              Generate Report
            </button>

            {/* Export Button */}
            {(registerReportData && registerReportData.length > 0) && canExport && (
              
              <button
                onClick={handleExportRegisterReportExcel}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export to Excel
              </button>
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            {activeTab === 'custom' && !showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'custom' ? 'Custom Leave Report' : `Leave Register Report (${registerReportView})`}
            </h1>
            <div className="text-sm text-gray-600">
              {activeTab === 'custom' ? totalRecords : (registerReportData?.length || 0)} total records
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'custom' ? (
              <>
                {!reportData ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Generate a report to see results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* SEARCH BAR */}
                    <input
                      type="text"
                      placeholder="Search results..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />

                    {paginatedData.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle size={48} className="mx-auto text-yellow-400 mb-4" />
                        <p className="text-gray-600">No data found for selected criteria</p>
                      </div>
                    ) : (
                      <>
                        {/* TABLE */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="text-sm border-collapse" style={{ minWidth: 'max-content' }}>
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <tr>
                                {selectedFields.map((col) => (
                                  <th
                                    key={col}
                                    onClick={() => handleSort(col)}
                                    className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                                    style={{ minWidth: '150px' }}
                                  >
                                    <div className="flex items-center gap-2">
                                      {leaveReportService.getFieldLabel(col, availableFields)}
                                      {sortConfig.column === col && (
                                        <span className="text-blue-600">
                                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                      )}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedData.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                  {selectedFields.map((col) => (
                                    <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '150px' }}>
                                      {String(row[col] || '-')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Records per page:</label>
                            <select
                              value={pageSize}
                              onChange={handlePageSizeChange}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                          </div>

                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {endIndex} of {totalRecords}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <ChevronLeft size={18} />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              const pageNum = Math.max(1, currentPage - 2) + i;
                              if (pageNum > totalPages) return null;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1 rounded ${currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'hover:bg-gray-100'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {!registerReportData ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Generate a report to see results</p>
                  </div>
                ) : registerReportData.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-yellow-400 mb-4" />
                    <p className="text-gray-600">No data found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* REGISTER REPORT TABLE */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="text-sm border-collapse" style={{ minWidth: 'max-content' }}>
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            {registerReportData.length > 0 && Object.keys(registerReportData[0]).map((col) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
                                style={{ minWidth: '150px' }}
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {registerReportData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                              {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '150px' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReports;
